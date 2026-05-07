from flask import Flask, render_template, request, jsonify
import numpy as np
import base64
import cv2
from tensorflow.keras.models import load_model

app = Flask(__name__)

# Load model once at startup
model = load_model('asl_model.h5')

# Label map — A=0, B=1, etc. (no J=9, no Z=25)
label_map = {i: chr(65 + i) for i in range(25)}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json.get('image')
    if not data:
        return jsonify({'error': 'No image provided'}), 400

    # Decode base64 image
    img_data = base64.b64decode(data.split(',')[1])
    img_array = np.frombuffer(img_data, dtype=np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_GRAYSCALE)

    # Preprocess to match training data
    img = cv2.resize(img, (28, 28))
    img = img / 255.0
    img = img.reshape(1, 28, 28, 1)

    # Predict
    pred = model.predict(img, verbose=0)
    top3_idx = np.argsort(pred[0])[::-1][:3]
    top3 = [
        {'letter': label_map[int(i)], 'confidence': float(pred[0][i]) * 100}
        for i in top3_idx
    ]

    return jsonify({'predictions': top3})

if __name__ == '__main__':
    app.run(debug=True)

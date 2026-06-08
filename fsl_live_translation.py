"""
Standalone live FSL translation (same pipeline as the Tkinter app).
Run: python fsl_live_translation.py
Press 'q' to quit.
"""
import cv2
import numpy as np
import mediapipe as mp
from tensorflow.keras.models import load_model
import joblib
from pathlib import Path

MODELS_DIR = Path(__file__).resolve().parent / 'models'
THRESHOLD = 0.85
SEQUENCE_LENGTH = 30

print("Loading AI model and translators...")
actions = np.load(MODELS_DIR / 'action_labels_11.npy', allow_pickle=True)
scaler = joblib.load(MODELS_DIR / 'scaler.pkl')

keras_path = MODELS_DIR / 'fsl_11_model.keras'
h5_path = MODELS_DIR / 'fsl_11_model.h5'
if keras_path.exists():
    model = load_model(str(keras_path))
elif h5_path.exists():
    try:
        model = load_model(str(h5_path))
    except Exception:
        from fsl_translator_app import load_fsl_model
        model = load_fsl_model()
else:
    raise FileNotFoundError("No model file in models/")

mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils


def mediapipe_detection(image, holistic_model):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image.flags.writeable = False
    results = holistic_model.process(image)
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    return image, results


def extract_keypoints(results):
    pose = np.array(
        [[res.x, res.y, res.z, res.visibility] for res in results.pose_landmarks.landmark]
    ).flatten() if results.pose_landmarks else np.zeros(33 * 4)
    lh = np.array(
        [[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]
    ).flatten() if results.left_hand_landmarks else np.zeros(21 * 3)
    rh = np.array(
        [[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]
    ).flatten() if results.right_hand_landmarks else np.zeros(21 * 3)
    return np.concatenate([pose, lh, rh])


sequence = []
sentence = []

print("Starting webcam...")
cap = cv2.VideoCapture(0)

with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        image, results = mediapipe_detection(frame, holistic)
        mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_holistic.POSE_CONNECTIONS)
        mp_drawing.draw_landmarks(image, results.left_hand_landmarks, mp_holistic.HAND_CONNECTIONS)
        mp_drawing.draw_landmarks(image, results.right_hand_landmarks, mp_holistic.HAND_CONNECTIONS)

        keypoints = extract_keypoints(results)
        sequence.append(keypoints)
        sequence = sequence[-SEQUENCE_LENGTH:]

        if len(sequence) == SEQUENCE_LENGTH:
            seq_array = np.array(sequence, dtype=np.float32)
            seq_reshaped = seq_array.reshape(-1, seq_array.shape[-1])
            seq_scaled = scaler.transform(seq_reshaped)
            model_input = np.expand_dims(seq_scaled, axis=0)

            res = model.predict(model_input, verbose=0)[0]
            best_guess = int(np.argmax(res))
            confidence = float(res[best_guess])

            if confidence > THRESHOLD:
                current_sign = str(actions[best_guess])
                if len(sentence) > 0:
                    if current_sign != sentence[-1]:
                        sentence.append(current_sign)
                else:
                    sentence.append(current_sign)

            if len(sentence) > 5:
                sentence = sentence[-5:]

        cv2.rectangle(image, (0, 0), (640, 40), (245, 117, 16), -1)
        banner = ' '.join(s.replace('_', ' ') for s in sentence)
        cv2.putText(
            image, banner, (15, 30), cv2.FONT_HERSHEY_SIMPLEX,
            1, (255, 255, 255), 2, cv2.LINE_AA,
        )

        cv2.imshow('FSL Live Translation', image)
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break

cap.release()
cv2.destroyAllWindows()

"""
Quick verification script to check if your model is compatible
"""
import numpy as np
import joblib
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from keras.layers import Conv1D

print("=" * 60)
print("MODEL COMPATIBILITY CHECK")
print("=" * 60)

# Load actions
try:
    actions = np.load('../models/action_labels_11.npy', allow_pickle=True)
    print(f"✓ Actions loaded: {len(actions)} actions")
    print(f"  Sample actions: {actions[:5]}")
except Exception as e:
    print(f"✗ Error loading actions: {e}")
    exit(1)

# Build model architecture
try:
    from tensorflow.keras.layers import Dropout
    from tensorflow.keras.regularizers import l2
    
    model = Sequential()
    # 1. Feature Extraction with early dropout
    model.add(Conv1D(64, kernel_size=3, activation='relu', input_shape=(30, 258)))
    model.add(Dropout(0.3))
    # 2. Smaller LSTMs with Heavy L2 Regularization
    model.add(LSTM(64, return_sequences=True, kernel_regularizer=l2(0.001)))
    model.add(Dropout(0.5))
    model.add(LSTM(128, return_sequences=False, kernel_regularizer=l2(0.001)))
    model.add(Dropout(0.5))
    # 3. Dense Classification Head
    model.add(Dense(64, activation='relu', kernel_regularizer=l2(0.001)))
    model.add(Dropout(0.3))
    model.add(Dense(actions.shape[0], activation='softmax'))
    model.compile(optimizer='Adam', loss='categorical_crossentropy', metrics=['categorical_accuracy'])
    print(f"✓ Model architecture built successfully")
except Exception as e:
    print(f"✗ Error building model: {e}")
    exit(1)

# Load weights
try:
    model.load_weights('../models/fsl_11_model.h5')
    print(f"✓ Model weights loaded from fsl_11_model.h5 ({len(actions)} classes)")
except Exception as e:
    print(f"✗ Error loading model weights: {e}")
    exit(1)

# Load scaler
try:
    scaler = joblib.load('../models/scaler.pkl')
    print(f"✓ Scaler loaded from scaler.pkl ({scaler.n_features_in_} features per frame)")
except Exception as e:
    print(f"✗ Error loading scaler: {e}")
    exit(1)

# Test prediction with dummy data
try:
    dummy_sequence = scaler.transform(np.random.rand(30, 258).astype(np.float32))
    prediction = model.predict(np.expand_dims(dummy_sequence, axis=0), verbose=0)
    predicted_action = actions[np.argmax(prediction[0])]
    confidence = np.max(prediction[0])
    print(f"✓ Test prediction successful")
    print(f"  Predicted action: {predicted_action}")
    print(f"  Confidence: {confidence:.2%}")
except Exception as e:
    print(f"✗ Error during prediction: {e}")
    exit(1)

print("=" * 60)
print("✓ ALL CHECKS PASSED - Model is ready to use!")
print("=" * 60)
print("\nYou can now run:")
print("  python test_live.py   - for webcam testing")
print("  python test_video.py  - for video file testing")

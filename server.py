import os
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Conv1D
from tensorflow.keras.regularizers import l2
from collections import deque
import json
import asyncio

# ==========================================
# CONFIGURATION
# ==========================================
CONFIDENCE_THRESHOLD = 0.65
STABILITY_WINDOW = 15
MIN_SIGN_DURATION = 20
SEQUENCE_LENGTH = 30

# ==========================================
# SIGN STABILIZER
# ==========================================
class SignStabilizer:
    def __init__(self, window_size=STABILITY_WINDOW, min_duration=MIN_SIGN_DURATION):
        self.window_size = window_size
        self.min_duration = min_duration
        self.prediction_history = deque(maxlen=window_size)
        self.current_sign = None
        self.current_sign_count = 0
        
    def add_prediction(self, predicted_idx, confidence):
        self.prediction_history.append((predicted_idx, confidence))
        
        if len(self.prediction_history) >= self.window_size:
            predictions = [p[0] for p in self.prediction_history]
            unique, counts = np.unique(predictions, return_counts=True)
            most_common_idx = unique[np.argmax(counts)]
            most_common_count = np.max(counts)
            avg_confidence = np.mean([c for p, c in self.prediction_history if p == most_common_idx])
            
            stability_ratio = most_common_count / self.window_size
            
            if stability_ratio >= 0.6 and avg_confidence >= CONFIDENCE_THRESHOLD:
                if most_common_idx == self.current_sign:
                    self.current_sign_count += 1
                else:
                    self.current_sign = most_common_idx
                    self.current_sign_count = 1
                
                if self.current_sign_count >= self.min_duration:
                    return most_common_idx, avg_confidence, True
        
        return None, 0, False
    
    def reset(self):
        self.current_sign = None
        self.current_sign_count = 0
        self.prediction_history.clear()

# ==========================================
# FASTAPI APP
# ==========================================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State
model = None
actions = None
stabilizer = SignStabilizer()

def load_model():
    global model, actions
    try:
        print("Loading model V2...")
        # Load actions
        actions = np.load('models/action_labels.npy', allow_pickle=True)
        
        # Build model architecture (must match fsl_translator_app_v2.py)
        model = Sequential()
        model.add(Conv1D(64, kernel_size=3, activation='relu', input_shape=(30, 258)))
        model.add(Dropout(0.3))
        model.add(LSTM(64, return_sequences=True, kernel_regularizer=l2(0.001)))
        model.add(Dropout(0.5))
        model.add(LSTM(128, return_sequences=False, kernel_regularizer=l2(0.001)))
        model.add(Dropout(0.5))
        model.add(Dense(64, activation='relu', kernel_regularizer=l2(0.001)))
        model.add(Dropout(0.3))
        model.add(Dense(actions.shape[0], activation='softmax'))
        model.compile(optimizer='Adam', loss='categorical_crossentropy', metrics=['categorical_accuracy'])
        
        # Load weights
        model.load_weights('models/fsl_105_model_2.h5')
        print(f"Model V2 loaded successfully with {len(actions)} signs.")
    except Exception as e:
        print(f"Error loading model: {e}")

@app.on_event("startup")
async def startup_event():
    load_model()

@app.get("/")
async def root():
    return {"status": "FSL Recognition Server Running", "signs": len(actions) if actions is not None else 0}

@app.websocket("/ws/recognize")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    sequence = []
    print("WebSocket client connected")
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "keypoints":
                keypoints = np.array(message.get("data"))
                sequence.append(keypoints)
                sequence = sequence[-SEQUENCE_LENGTH:]
                
                if len(sequence) == SEQUENCE_LENGTH:
                    # Run prediction
                    res = model.predict(np.expand_dims(sequence, axis=0), verbose=0)[0]
                    predicted_idx = np.argmax(res)
                    confidence = float(res[predicted_idx])
                    
                    # Check stability
                    stable_idx, stable_conf, is_stable = stabilizer.add_prediction(predicted_idx, confidence)
                    
                    response = {
                        "type": "prediction",
                        "sign": actions[predicted_idx] if confidence > 0.4 else "...",
                        "confidence": confidence,
                        "stable": is_stable,
                        "stable_sign": actions[stable_idx] if is_stable else None
                    }
                    await websocket.send_text(json.dumps(response))
                    
                    if is_stable:
                        stabilizer.reset()
            
            elif message.get("type") == "reset":
                sequence = []
                stabilizer.reset()
                await websocket.send_text(json.dumps({"type": "status", "message": "Reset complete"}))
                
    except WebSocketDisconnect:
        print("WebSocket client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

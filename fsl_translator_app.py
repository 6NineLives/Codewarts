"""
Filipino Sign Language Translator - Final Version
Modern UI with Simple Sentence Builder
"""

import tkinter as tk
from tkinter import ttk, messagebox
import cv2
from PIL import Image, ImageTk
import numpy as np
import mediapipe as mp
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Conv1D
from tensorflow.keras.regularizers import l2
from collections import deque
import threading
import os
import pyttsx3

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
# SIMPLE SENTENCE BUILDER (No AI needed)
# ==========================================
class SentenceBuilder:
    def __init__(self):
        # Common patterns for natural sentences
        self.greetings = ['HELLO', 'HI', 'GOOD_MORNING', 'GOOD_AFTERNOON', 'GOOD_EVENING']
        self.questions = ['HOW', 'WHAT', 'WHERE', 'WHEN', 'WHY', 'WHO']
        self.connectors = {
            'GOOD_MORNING': 'Good morning',
            'GOOD_AFTERNOON': 'Good afternoon',
            'GOOD_EVENING': 'Good evening',
            'NICE_TO_MEET_YOU': "Nice to meet you",
            'HOW_ARE_YOU': "How are you",
            'THANK_YOU': "Thank you",
            'YOURE_WELCOME': "You're welcome",
            'SEE_YOU_TOMORROW': "See you tomorrow",
            'IM_FINE': "I'm fine",
            'DONT_KNOW': "I don't know",
            'DONT_UNDERSTAND': "I don't understand"
        }
    
    def build_sentence(self, signs):
        """Convert signs into a natural sentence"""
        if not signs:
            return ""
        
        # Handle multi-word phrases first
        result = []
        i = 0
        while i < len(signs):
            sign = signs[i]
            
            # Check if it's a known phrase
            if sign in self.connectors:
                result.append(self.connectors[sign])
            else:
                # Convert underscore to space and title case
                word = sign.replace('_', ' ').title()
                result.append(word)
            
            i += 1
        
        # Join words
        sentence = ' '.join(result)
        
        # Add punctuation
        if any(q in signs for q in self.questions):
            sentence += '?'
        elif any(g in signs for g in self.greetings):
            sentence += '!'
        else:
            sentence += '.'
        
        # Capitalize first letter
        if sentence:
            sentence = sentence[0].upper() + sentence[1:]
        
        return sentence

# ==========================================
# MAIN APPLICATION
# ==========================================
class FSLTranslatorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Filipino Sign Language Translator")
        self.root.geometry("1400x900")
        self.root.configure(bg='#1e1e1e')
        
        # State variables
        self.is_collecting = False
        self.cap = None
        self.model = None
        self.actions = None
        self.stabilizer = SignStabilizer()
        self.sentence_builder = SentenceBuilder()
        self.detected_signs = []
        self.sequence = []
        self.video_running = False
        self.current_frame = None
        self.frame_lock = threading.Lock()
        
        # MediaPipe
        self.mp_holistic = mp.solutions.holistic
        self.mp_drawing = mp.solutions.drawing_utils
        self.holistic = None
        
        # Text-to-Speech
        try:
            self.tts_engine = pyttsx3.init()
            
            # Optimize TTS settings for faster response
            self.tts_engine.setProperty('rate', 180)  # Slightly faster speech
            self.tts_engine.setProperty('volume', 0.9)  # Volume (0.0 to 1.0)
            
            # Test the engine to make sure it works and pre-warm it
            voices = self.tts_engine.getProperty('voices')
            if voices:
                # Use the first available voice
                self.tts_engine.setProperty('voice', voices[0].id)
            
            # Pre-warm the TTS engine with a silent test
            self.tts_engine.say("")
            self.tts_engine.runAndWait()
            
            self.tts_available = True
            self._tts_thread = None  # Initialize thread tracker
            print("TTS initialized and pre-warmed successfully")
        except Exception as e:
            print(f"TTS initialization failed: {e}")
            self.tts_available = False
        
        # Setup UI
        self.setup_ui()
        
        # Load model
        self.load_model()
        
        # Start camera immediately
        self.root.after(100, self.start_camera)
        
        # Start UI update loop
        self.update_frame()
        
    def setup_ui(self):
        # Title
        title_frame = tk.Frame(self.root, bg='#2d2d2d', height=80)
        title_frame.pack(fill=tk.X, padx=10, pady=10)
        title_frame.pack_propagate(False)
        
        tk.Label(title_frame, text="🤟 Filipino Sign Language Translator", 
                font=('Arial', 24, 'bold'), bg='#2d2d2d', fg='#ffffff').pack(pady=20)
        
        # Main content area
        content_frame = tk.Frame(self.root, bg='#1e1e1e')
        content_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        # Left side - Video feed
        left_frame = tk.Frame(content_frame, bg='#2d2d2d', width=900)
        left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 5))
        
        tk.Label(left_frame, text="Camera Feed", font=('Arial', 14, 'bold'), 
                bg='#2d2d2d', fg='#ffffff').pack(pady=10)
        
        self.video_label = tk.Label(left_frame, bg='#000000')
        self.video_label.pack(padx=10, pady=10, fill=tk.BOTH, expand=True)
        
        # Right side - Controls and output
        right_frame = tk.Frame(content_frame, bg='#2d2d2d', width=450)
        right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, padx=(5, 0))
        right_frame.pack_propagate(False)
        
        # Status
        status_frame = tk.LabelFrame(right_frame, text="Status", 
                                    font=('Arial', 12, 'bold'), bg='#2d2d2d', fg='#ffffff')
        status_frame.pack(fill=tk.X, padx=10, pady=10)
        
        self.status_label = tk.Label(status_frame, text="Ready", 
                                     font=('Arial', 11), bg='#2d2d2d', fg='#00ff00')
        self.status_label.pack(pady=10)
        
        # Detected Signs
        signs_frame = tk.LabelFrame(right_frame, text="Detected Signs", 
                                   font=('Arial', 12, 'bold'), bg='#2d2d2d', fg='#ffffff')
        signs_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        self.signs_text = tk.Text(signs_frame, height=8, font=('Arial', 11), 
                                 bg='#3d3d3d', fg='#ffffff', wrap=tk.WORD,
                                 insertbackground='#ffffff')
        self.signs_text.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Translation Output
        output_frame = tk.LabelFrame(right_frame, text="Translation", 
                                    font=('Arial', 12, 'bold'), bg='#2d2d2d', fg='#ffffff')
        output_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        self.output_text = tk.Text(output_frame, height=6, font=('Arial', 12, 'bold'), 
                                   bg='#3d3d3d', fg='#00ff00', wrap=tk.WORD,
                                   insertbackground='#ffffff')
        self.output_text.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Control buttons
        button_frame = tk.Frame(right_frame, bg='#2d2d2d')
        button_frame.pack(fill=tk.X, padx=10, pady=10)
        
        self.start_button = tk.Button(button_frame, text="▶ Start Collecting Signs", 
                                      command=self.toggle_collection,
                                      bg='#00aa00', fg='#ffffff', 
                                      font=('Arial', 14, 'bold'),
                                      height=2, cursor='hand2')
        self.start_button.pack(fill=tk.X, pady=5)
        
        # TTS toggle
        self.tts_enabled = tk.BooleanVar(value=True)
        tts_check = tk.Checkbutton(button_frame, text="🔊 Read translation aloud", 
                                   variable=self.tts_enabled,
                                   bg='#2d2d2d', fg='#ffffff', 
                                   selectcolor='#3d3d3d',
                                   font=('Arial', 10),
                                   activebackground='#2d2d2d',
                                   activeforeground='#ffffff')
        tts_check.pack(pady=5)
        
        tk.Button(button_frame, text="🗑️ Clear All", command=self.clear_all,
                 bg='#aa0000', fg='#ffffff', font=('Arial', 12, 'bold'),
                 height=1, cursor='hand2').pack(fill=tk.X, pady=5)
        
        # Reset TTS button
        tk.Button(button_frame, text="🔄 Reset TTS", command=self.reset_tts_engine,
                 bg='#0066aa', fg='#ffffff', font=('Arial', 10),
                 height=1, cursor='hand2').pack(fill=tk.X, pady=2)
        
        # Quick TTS test button
        tk.Button(button_frame, text="🎤 Test TTS", command=lambda: self.speak_text("Test"),
                 bg='#6600aa', fg='#ffffff', font=('Arial', 9),
                 height=1, cursor='hand2').pack(fill=tk.X, pady=1)
        
    def load_model(self):
        try:
            self.status_label.config(text="Loading model...", fg='#ffaa00')
            self.root.update()
            
            # Load actions
            self.actions = np.load('models/action_labels.npy', allow_pickle=True)
            
            # Build model
            self.model = Sequential()
            self.model.add(Conv1D(64, kernel_size=3, activation='relu', input_shape=(30, 258)))
            self.model.add(Dropout(0.3))
            self.model.add(LSTM(64, return_sequences=True, kernel_regularizer=l2(0.001)))
            self.model.add(Dropout(0.5))
            self.model.add(LSTM(128, return_sequences=False, kernel_regularizer=l2(0.001)))
            self.model.add(Dropout(0.5))
            self.model.add(Dense(64, activation='relu', kernel_regularizer=l2(0.001)))
            self.model.add(Dropout(0.3))
            self.model.add(Dense(self.actions.shape[0], activation='softmax'))
            self.model.compile(optimizer='Adam', loss='categorical_crossentropy', 
                             metrics=['categorical_accuracy'])
            
            # Load weights
            self.model.load_weights('models/fsl_105_model.h5')
            
            self.status_label.config(text=f"Model loaded ({len(self.actions)} signs)", fg='#00ff00')
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load model:\n{e}")
            self.status_label.config(text="Model load failed", fg='#ff0000')
    
    def start_camera(self):
        """Start camera and video processing (always on)"""
        if self.video_running:
            return
            
        try:
            self.cap = cv2.VideoCapture(0)
            if not self.cap.isOpened():
                raise Exception("Could not open camera")
                
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
            
            # Test read
            ret, frame = self.cap.read()
            if not ret:
                raise Exception("Could not read from camera")
            
            # Initialize MediaPipe
            self.holistic = self.mp_holistic.Holistic(
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
            
            self.video_running = True
            self.status_label.config(text="Camera active - Ready", fg='#00ff00')
            print("Camera started successfully")
            
            # Start video thread
            self.video_thread = threading.Thread(target=self.process_video, daemon=True)
            self.video_thread.start()
        except Exception as e:
            messagebox.showerror("Camera Error", f"Failed to start camera:\n{e}")
            self.status_label.config(text="Camera error", fg='#ff0000')
            print(f"Camera error: {e}")
    
    def toggle_collection(self):
        """Toggle sign collection for translation"""
        if not self.is_collecting:
            self.start_collection()
        else:
            self.stop_collection()
    
    def start_collection(self):
        """Start collecting signs for translation"""
        self.is_collecting = True
        self.start_button.config(text="⏹ Stop & Translate", bg='#aa0000')
        self.status_label.config(text="Collecting signs...", fg='#ffaa00')
        self.detected_signs = []  # Clear previous signs
        self.update_signs_display()
    
    def stop_collection(self):
        """Stop collecting and generate translation"""
        self.is_collecting = False
        self.start_button.config(text="▶ Start Collecting Signs", bg='#00aa00')
        self.status_label.config(text="Building sentence...", fg='#ffaa00')
        
        # Generate final translation using SentenceBuilder
        if self.detected_signs:
            translation = self.sentence_builder.build_sentence(self.detected_signs)
            self.output_text.delete(1.0, tk.END)
            self.output_text.insert(1.0, translation)
            self.status_label.config(text="Translation complete", fg='#00ff00')
            
            # Read translation aloud
            if self.tts_enabled.get() and self.tts_available:
                self.speak_text(translation)
        else:
            self.status_label.config(text="No signs detected", fg='#ff0000')
    
    def speak_text(self, text):
        """Speak text using TTS with minimal delay"""
        if not self.tts_available or not text.strip():
            print("TTS not available or empty text")
            return
        
        # Immediate feedback - show that TTS is starting
        print(f"Speaking: {text}")
            
        def speak():
            try:
                # Clear any pending speech first
                self.tts_engine.stop()
                
                # Use the main engine instance with optimized settings
                self.tts_engine.say(text)
                self.tts_engine.runAndWait()
                
            except Exception as e:
                print(f"TTS error: {e}")
                # Quick backup without full initialization
                try:
                    import subprocess
                    import sys
                    
                    # Try Windows SAPI for faster speech (Windows only)
                    if sys.platform == "win32":
                        # Use Windows built-in speech
                        subprocess.run([
                            "powershell", "-Command", 
                            f"Add-Type -AssemblyName System.Speech; "
                            f"$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; "
                            f"$speak.Rate = 2; "
                            f"$speak.Speak('{text.replace(chr(39), chr(39)+chr(39))}');"
                        ], capture_output=True, timeout=10)
                    else:
                        # Fallback for other systems
                        backup_engine = pyttsx3.init()
                        backup_engine.setProperty('rate', 180)  # Faster rate
                        backup_engine.setProperty('volume', 0.9)
                        backup_engine.say(text)
                        backup_engine.runAndWait()
                        backup_engine.stop()
                        del backup_engine
                        
                except Exception as e2:
                    print(f"All TTS methods failed: {e2}")
        
        # Use thread pool for better performance
        if not hasattr(self, '_tts_thread') or not self._tts_thread.is_alive():
            self._tts_thread = threading.Thread(target=speak, daemon=True)
            self._tts_thread.start()
        else:
            # If previous TTS is still running, queue this one
            def delayed_speak():
                self._tts_thread.join(timeout=2)  # Wait max 2 seconds
                speak()
            
            threading.Thread(target=delayed_speak, daemon=True).start()
    
    def reset_tts_engine(self):
        """Reset TTS engine if it gets stuck"""
        try:
            if hasattr(self, 'tts_engine') and self.tts_engine:
                self.tts_engine.stop()
            
            # Reinitialize the engine
            self.tts_engine = pyttsx3.init()
            self.tts_engine.setProperty('rate', 150)
            self.tts_engine.setProperty('volume', 0.9)
            
            voices = self.tts_engine.getProperty('voices')
            if voices:
                self.tts_engine.setProperty('voice', voices[0].id)
            
            print("TTS engine reset successfully")
            return True
        except Exception as e:
            print(f"Failed to reset TTS engine: {e}")
            return False
    
    def process_video(self):
        """Process video frames continuously (simplified approach)"""
        print("Video processing thread started")
        while self.video_running and self.cap and self.cap.isOpened():
            ret, frame = self.cap.read()
            if not ret:
                print("Failed to read frame")
                break
            
            # Process frame with MediaPipe
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
            results = self.holistic.process(image)
            image.flags.writeable = True
            
            # Draw landmarks
            if results.pose_landmarks:
                self.mp_drawing.draw_landmarks(
                    image, results.pose_landmarks, self.mp_holistic.POSE_CONNECTIONS,
                    self.mp_drawing.DrawingSpec(color=(80,22,10), thickness=2, circle_radius=4),
                    self.mp_drawing.DrawingSpec(color=(80,44,121), thickness=2, circle_radius=2)
                )
            if results.left_hand_landmarks:
                self.mp_drawing.draw_landmarks(
                    image, results.left_hand_landmarks, self.mp_holistic.HAND_CONNECTIONS,
                    self.mp_drawing.DrawingSpec(color=(121,22,76), thickness=2, circle_radius=4),
                    self.mp_drawing.DrawingSpec(color=(121,44,250), thickness=2, circle_radius=2)
                )
            if results.right_hand_landmarks:
                self.mp_drawing.draw_landmarks(
                    image, results.right_hand_landmarks, self.mp_holistic.HAND_CONNECTIONS,
                    self.mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=4),
                    self.mp_drawing.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2)
                )
            
            # Extract keypoints and make prediction
            keypoints = self.extract_keypoints(results)
            self.sequence.append(keypoints)
            self.sequence = self.sequence[-SEQUENCE_LENGTH:]
            
            # Make prediction when we have enough frames
            if len(self.sequence) == SEQUENCE_LENGTH:
                res = self.model.predict(np.expand_dims(self.sequence, axis=0), verbose=0)[0]
                predicted_idx = np.argmax(res)
                confidence = res[predicted_idx]
                
                # Check stability
                stable_idx, stable_conf, is_stable = self.stabilizer.add_prediction(predicted_idx, confidence)
                
                # Only add to detected_signs if we're collecting
                if is_stable and self.is_collecting:
                    sign = self.actions[stable_idx]
                    if len(self.detected_signs) == 0 or self.detected_signs[-1] != sign:
                        self.detected_signs.append(sign)
                        self.root.after(0, self.update_signs_display)
                        self.stabilizer.reset()
                elif is_stable and not self.is_collecting:
                    self.stabilizer.reset()
            
            # Store frame for display (thread-safe)
            with self.frame_lock:
                self.current_frame = image.copy()
        
        print("Video processing thread ended")
    
    def update_frame(self):
        """Update video frame display (runs in main thread)"""
        try:
            with self.frame_lock:
                if self.current_frame is not None:
                    # Resize for display
                    image = cv2.resize(self.current_frame, (860, 640))
                    img = Image.fromarray(image)
                    imgtk = ImageTk.PhotoImage(image=img)
                    self.video_label.imgtk = imgtk
                    self.video_label.configure(image=imgtk)
        except Exception as e:
            print(f"Frame update error: {e}")
        
        # Schedule next update
        self.root.after(30, self.update_frame)  # ~33 FPS
    
    def extract_keypoints(self, results):
        pose = np.array([[res.x, res.y, res.z, res.visibility] 
                        for res in results.pose_landmarks.landmark]).flatten() \
               if results.pose_landmarks else np.zeros(33*4)
        lh = np.array([[res.x, res.y, res.z] 
                      for res in results.left_hand_landmarks.landmark]).flatten() \
             if results.left_hand_landmarks else np.zeros(21*3)
        rh = np.array([[res.x, res.y, res.z] 
                      for res in results.right_hand_landmarks.landmark]).flatten() \
             if results.right_hand_landmarks else np.zeros(21*3)
        return np.concatenate([pose, lh, rh])
    
    def update_signs_display(self):
        signs_display = " → ".join([s.replace('_', ' ') for s in self.detected_signs])
        self.signs_text.delete(1.0, tk.END)
        self.signs_text.insert(1.0, signs_display)
    
    def clear_all(self):
        self.detected_signs = []
        self.sequence = []
        self.stabilizer.reset()
        self.signs_text.delete(1.0, tk.END)
        self.output_text.delete(1.0, tk.END)
        if self.is_collecting:
            self.status_label.config(text="Cleared - Still collecting", fg='#ffaa00')
        else:
            self.status_label.config(text="Cleared - Ready", fg='#00ff00')
    
    def on_closing(self):
        self.video_running = False
        if self.cap:
            self.cap.release()
        if self.holistic:
            self.holistic.close()
        self.root.destroy()

# ==========================================
# MAIN
# ==========================================
if __name__ == "__main__":
    root = tk.Tk()
    app = FSLTranslatorApp(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()

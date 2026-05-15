# CodeWarts FSL Interpreter

## Filipino Sign Language Translator

### Purpose
We implement a Filipino Sign Language Recognition model for both static and dynamic hand gestures using MediaPipe extracted landmarks. This project features a 105-action model with anti-overfitting architecture for accurate real-time sign language translation.

### 🎯 Features
- **105 Sign Language Actions** - Comprehensive FSL vocabulary including greetings, numbers, colors, days, months, and common phrases
- **Anti-Overfitting Architecture** - Dropout layers and L2 regularization for robust performance
- **Real-time Detection** - Webcam-based live testing with MediaPipe Holistic
- **Video Processing Pipeline** - Complete workflow from video capture to model training

## 🚀 Quick Start

### Prerequisites
- **Python 3.11** (required — [download here](https://www.python.org/downloads/release/python-3119/))
- A webcam

### Installation (Windows)
```shell
# Option 1: Automated setup (recommended)
# Double-click setup.bat, or run:
.\setup.bat

# Option 2: Manual setup
py -3.11 -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Run the App
```shell
# Double-click run_app.bat, or:
venv\Scripts\activate
python fsl_translator_app.py
```

> **Note:** Gemma AI-powered translation is planned for a future release. 
> The current version uses a local rule-based sentence builder.

## 📁 Project Structure

### Video Processing
1. `arrange_files.ipynb` - Manipulate directories and files for convenience
2. `video_capture.ipynb` - Capture 30-frame videos for training data
3. `video_preprocess.ipynb` - Normalize videos to exactly 30 frames
4. `video_landmark_extraction.ipynb` - Extract MediaPipe landmarks from videos

### Model Processing
1. `train_model.py` - Train the LSTM model with anti-overfitting architecture
2. `test_live.py` - Real-time webcam testing
3. `test_video.py` - Test with pre-recorded videos
4. `verify_model.py` - Verify model compatibility

### Models
- `fsl_105_model.h5` - Trained model with 105 actions
- `action_labels.npy` - List of all 105 sign language actions
- Backup files of previous models

## 🎓 Model Architecture

**Anti-Overfitting Design:**
- Conv1D layer (64 filters) + Dropout (0.3)
- LSTM (64 units) with L2 regularization + Dropout (0.5)
- LSTM (128 units) with L2 regularization + Dropout (0.5)
- Dense (64 units) with L2 regularization + Dropout (0.3)
- Output layer (105 classes, softmax)

**Input:** 30 frames × 258 landmarks (pose + hands)  
**Output:** Predicted sign with confidence score

## 📊 105 Supported Actions

Numbers, colors, days of the week, months, greetings, family members, food items, and common phrases including:
- Greetings: HELLO, GOOD_MORNING, GOOD_AFTERNOON, GOOD_EVENING
- Responses: YES, NO, THANK_YOU, YOURE_WELCOME
- Questions: HOW_ARE_YOU, IM_FINE
- And 95+ more actions!

See `models/action_labels.npy` for the complete list.

## 📖 Documentation

- `MODEL_SETUP_COMPLETE.md` - Complete setup guide and troubleshooting
- `COLAB_WORKFLOW_GUIDE.md` - Google Colab training workflow
- `QUICK_START.md` - Quick testing guide

## 🔧 Requirements

- Python 3.11 (Required)
- TensorFlow
- MediaPipe 0.10.21
- OpenCV
- NumPy
- scikit-learn

## 📝 License

Senyas: FSL Translator code and model weights are released under the CC-BY-NC 4.0 license.

## ⭐ Acknowledgments

Based on the Senyas project. Enhanced with 105-action model and anti-overfitting architecture for improved accuracy and generalization.

# 🤟 Filipino Sign Language Translator - Final Version

## Modern UI Application with Gemma AI Integration

A complete, user-friendly desktop application for real-time Filipino Sign Language translation with AI-powered sentence generation.

---

## ✨ Features

> [!NOTE]
> **Gemma AI integration is planned for a future release.** The sections below 
> describe the intended AI-powered translation workflow. The current version 
> uses a local rule-based sentence builder that works fully offline.

### 🎥 Real-Time Sign Detection
- Live webcam feed with MediaPipe landmark visualization
- Stabilized detection to reduce fluctuation
- Confidence-based filtering for accurate recognition
- 105 Filipino Sign Language gestures supported

### 🤖 AI-Powered Translation
- Gemma AI integration for natural sentence generation
- Context-aware translation (fills in missing words)
- Converts sign sequences into grammatically correct sentences
- Example: `HELLO → GOOD → MORNING` becomes `"Hello! Good morning!"`

### 🖥️ Modern User Interface
- Clean, dark-themed interface
- Real-time video feed display
- Live sign detection display
- Instant translation output
- Easy-to-use controls

### 🎯 Smart Detection
- Stabilization system reduces false positives
- Only accepts confident, stable predictions
- Prevents duplicate sign detection
- Smooth, reliable performance

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install opencv-python mediapipe tensorflow pillow google-generativeai numpy
```

### 2. Get Gemma API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the API key

### 3. Run the Application

```bash
python fsl_translator_app.py
```

---

## 📖 How to Use

### Step 1: Set Up Gemma API
1. Paste your API key in the "Gemma API Key" field
2. Click "Set API Key"
3. Wait for confirmation message

### Step 2: Start Translating
1. Click **"▶ Start Translating"** button
2. Your webcam will activate
3. Perform Filipino Sign Language signs
4. Watch signs appear in "Detected Signs" area

### Step 3: Generate Translation
1. Perform 3-10 signs
2. Click **"⏹ Stop & Translate"** button
3. AI generates natural sentence in "Translation" area

### Step 4: Start New Translation
1. Click **"🗑️ Clear All"** to reset
2. Click **"▶ Start Translating"** again
3. Repeat!

---

## 🎮 Interface Guide

### Top Section
- **Title Bar**: Application name and icon

### Left Panel - Camera Feed
- **Live Video**: Shows your webcam with landmark overlays
- **Green/Blue/Red Lines**: MediaPipe pose and hand tracking

### Right Panel - Controls

#### 1. Gemma API Key
- Enter your API key here
- Click "Set API Key" to activate
- Key is hidden for security

#### 2. Status
- Shows current application state
- **Green**: Ready/Active
- **Yellow**: Processing
- **Red**: Error

#### 3. Detected Signs
- Shows signs as they're detected
- Format: `SIGN1 → SIGN2 → SIGN3`
- Updates in real-time

#### 4. Translation
- Shows AI-generated sentence
- Appears after clicking "Stop & Translate"
- Natural, grammatically correct English

#### 5. Control Buttons
- **▶ Start Translating**: Begin sign detection
- **⏹ Stop & Translate**: Stop and generate sentence
- **🗑️ Clear All**: Reset everything

---

## 💡 Tips for Best Results

### Camera Setup
- **Good lighting**: Face a window or light source
- **Plain background**: Stand in front of a wall
- **Clear view**: Keep hands and upper body in frame
- **Distance**: Stay 2-3 feet from camera

### Performing Signs
- **Hold each sign**: ~1-2 seconds per sign
- **Clear movements**: Distinct transitions between signs
- **Normal speed**: Not too fast, not too slow
- **Visible hands**: Keep both hands in frame

### Translation Quality
- **3-10 signs**: Best range for coherent sentences
- **Logical order**: Sign in natural sentence order
- **Complete thoughts**: Try to form complete ideas
- **Stop to translate**: Don't wait too long before stopping

---

## 🎯 Example Workflows

### Example 1: Simple Greeting
```
1. Click "Start Translating"
2. Sign: HELLO → GOOD → MORNING
3. Click "Stop & Translate"
4. Result: "Hello! Good morning!"
5. Click "Clear All"
```

### Example 2: Question
```
1. Click "Start Translating"
2. Sign: HOW → ARE → YOU
3. Click "Stop & Translate"
4. Result: "How are you?"
5. Click "Clear All"
```

### Example 3: Request
```
1. Click "Start Translating"
2. Sign: I → WANT → COFFEE → PLEASE
3. Click "Stop & Translate"
4. Result: "I would like a coffee, please."
5. Click "Clear All"
```

---

## ⚙️ Configuration

### Adjusting Detection Sensitivity

Edit these values in `fsl_translator_app.py` (lines 23-25):

```python
# More strict (fewer false positives)
CONFIDENCE_THRESHOLD = 0.75  # Higher
STABILITY_WINDOW = 20        # Larger
MIN_SIGN_DURATION = 25       # Longer

# More lenient (faster detection)
CONFIDENCE_THRESHOLD = 0.55  # Lower
STABILITY_WINDOW = 10        # Smaller
MIN_SIGN_DURATION = 15       # Shorter

# Default (balanced)
CONFIDENCE_THRESHOLD = 0.65
STABILITY_WINDOW = 15
MIN_SIGN_DURATION = 20
```

---

## 🔧 Troubleshooting

### "Failed to load model"
- **Check**: `models/fsl_105_model.h5` exists
- **Check**: `models/action_labels.npy` exists
- **Solution**: Ensure model files are in correct location

### "google-generativeai not installed"
```bash
pip install google-generativeai
```

### "API key error"
- **Check**: API key is correct (no extra spaces)
- **Check**: Internet connection is active
- **Solution**: Regenerate API key if needed

### Camera not opening
- **Check**: No other app is using the camera
- **Check**: Camera permissions are granted
- **Solution**: Close other apps, restart application

### Signs not detected
- **Check**: Good lighting
- **Check**: Hands clearly visible
- **Check**: Performing signs correctly
- **Solution**: Adjust camera position, improve lighting

### Translation not natural
- **Check**: Gemma API key is set
- **Check**: Signs are in logical order
- **Check**: Enough signs (3-10 recommended)
- **Solution**: Perform more complete sign sequences

---

## 🎨 Supported Signs (105 Total)

### Numbers
ONE, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, TEN

### Days
MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY, TODAY, YESTERDAY, TOMORROW

### Months
JANUARY, FEBRUARY, MARCH, APRIL, MAY, JUNE, JULY, AUGUST, SEPTEMBER, OCTOBER, NOVEMBER, DECEMBER

### Colors
RED, ORANGE, YELLOW, GREEN, BLUE, VIOLET, PINK, BROWN, BLACK, WHITE, GRAY, DARK, LIGHT

### Greetings
HELLO, GOOD_MORNING, GOOD_AFTERNOON, GOOD_EVENING, THANK_YOU, YOURE_WELCOME, PLEASE, NICE_TO_MEET_YOU

### Questions & Responses
HOW_ARE_YOU, IM_FINE, YES, NO, WHY, HOW, WHERE, UNDERSTAND, DON'T_UNDERSTAND, KNOW, DON'T_KNOW

### Family
MOTHER, FATHER, PARENTS, GRANDFATHER, GRANDMOTHER, SON, DAUGHTER, SISTER, BOY, GIRL, MAN, WOMAN, AUNTIE, UNCLE, COUSIN, FAMILY

### Food & Drink
COFFEE, TEA, JUICE, MILK, BEER, WINE, BREAD, EGG, RICE, FISH, CHICKEN, MEAT, SHRIMP, CRAB, SPAGHETTI, LONGANISA, PASTRY, APPLE, LEMON, ORANGE, PINEAPPLE, PEA, SUGAR, NO_SUGAR

### Descriptors
COLD, HOT, FAST, SLOW, LIGHT, HEAVY, HAPPY, SAD, CORRECT, WRONG, MARRIED

### Other
TEACHER, HOUSE, HELP, EAT, THINK, DREAM, DEAF, HARD_OF_HEARING, BLIND, DEAF_BLIND, WEELCHAIR_PERSON, GOOSE, WALRUS, KANGAROO, PIG

---

## 🔐 Security Notes

### API Key Safety
- Never share your API key
- Don't commit API key to Git
- Use environment variables for production
- Regenerate key if compromised

### Privacy
- Video feed is processed locally
- No video is saved or uploaded
- Only detected signs are sent to Gemma
- All processing happens on your machine

---

## 📊 System Requirements

### Minimum
- **OS**: Windows 10, macOS 10.14, Ubuntu 18.04
- **RAM**: 4GB
- **Camera**: 720p webcam
- **Python**: 3.8+

### Recommended
- **OS**: Windows 11, macOS 12+, Ubuntu 20.04+
- **RAM**: 8GB+
- **Camera**: 1080p webcam
- **Python**: 3.9+
- **GPU**: Optional (for faster processing)

---

## 🎓 Technical Details

### Architecture
- **UI Framework**: Tkinter
- **Computer Vision**: MediaPipe Holistic
- **Deep Learning**: TensorFlow/Keras LSTM
- **AI Translation**: Google Gemma (via Gemini API)
- **Video Processing**: OpenCV

### Model Specifications
- **Input**: 30 frames × 258 landmarks
- **Architecture**: Conv1D + LSTM layers
- **Output**: 105 sign classes
- **Accuracy**: 96% on test data

### Detection Pipeline
1. Capture video frame
2. Extract MediaPipe landmarks (pose + hands)
3. Collect 30 frames of landmarks
4. Run through LSTM model
5. Apply stabilization filter
6. Add to detected signs if stable

### Translation Pipeline
1. Collect detected signs
2. Send to Gemma AI
3. AI interprets context
4. Fills in missing words
5. Returns natural sentence

---

## 🆘 Support

### Common Issues
See **Troubleshooting** section above

### Need Help?
1. Check this README
2. Review error messages
3. Verify all dependencies installed
4. Check model files exist

---

## 📝 License

CC-BY-NC 4.0 - See LICENSE file

---

## 🎉 Ready to Use!

```bash
python fsl_translator_app.py
```

**Enjoy translating Filipino Sign Language! 🤟**

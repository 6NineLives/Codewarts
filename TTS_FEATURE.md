# 🔊 Text-to-Speech Feature

> [!NOTE]
> **Gemma AI integration is planned for a future release.** The sections below 
> describe the intended AI-powered translation workflow. The current version 
> uses a local rule-based sentence builder that works fully offline.

## Overview

The FSL Translator now includes **automatic text-to-speech** that reads the translation aloud when you stop collecting signs!

---

## ✨ How It Works

### Automatic Speech
1. Click "Start Collecting Signs"
2. Perform your signs
3. Click "Stop & Translate"
4. **Translation appears AND is read aloud automatically!** 🔊

### Toggle On/Off
- **Checkbox**: "🔊 Read translation aloud"
- **Checked** (default): Translation is spoken
- **Unchecked**: Silent mode (text only)

---

## 🚀 Setup

### Install TTS Library
```bash
pip install pyttsx3
```

Or install all requirements:
```bash
pip install -r app_requirements.txt
```

### That's It!
- No API keys needed
- Works offline
- Uses your system's built-in TTS engine

---

## 🎮 Usage Examples

### Example 1: Greeting
```
1. Collect signs: HELLO → GOOD → MORNING
2. Click "Stop & Translate"
3. Text: "Hello! Good morning!"
4. Voice: 🔊 "Hello! Good morning!"
```

### Example 2: Question
```
1. Collect signs: HOW → ARE → YOU
2. Click "Stop & Translate"
3. Text: "How are you?"
4. Voice: 🔊 "How are you?"
```

### Example 3: Silent Mode
```
1. Uncheck "🔊 Read translation aloud"
2. Collect signs: THANK → YOU
3. Click "Stop & Translate"
4. Text: "Thank you!"
5. Voice: (silent)
```

---

## ⚙️ TTS Settings

The app uses these default settings:
- **Speed**: 150 words per minute (natural pace)
- **Volume**: 90% (clear but not too loud)
- **Voice**: Your system's default voice

### Want to Change Settings?

Edit `fsl_translator_app.py` around line 100:

```python
self.tts_engine.setProperty('rate', 150)    # Speed (100-200)
self.tts_engine.setProperty('volume', 0.9)  # Volume (0.0-1.0)
```

**Speed Options:**
- `100` - Slow (easier to understand)
- `150` - Normal (default)
- `200` - Fast (quicker)

**Volume Options:**
- `0.5` - Quiet
- `0.9` - Normal (default)
- `1.0` - Maximum

---

## 🎯 When TTS Speaks

### ✅ TTS Activates When:
- You click "Stop & Translate"
- Translation is generated (by Gemma or simple mode)
- Checkbox is checked
- Signs were detected

### ❌ TTS Does NOT Activate When:
- Checkbox is unchecked
- No signs were detected
- You click "Clear All"
- You're still collecting signs

---

## 🔧 Troubleshooting

### "TTS initialization failed"
**Windows:**
```bash
pip install pyttsx3
pip install pywin32
```

**Mac:**
```bash
pip install pyttsx3
pip install pyobjc
```

**Linux:**
```bash
pip install pyttsx3
sudo apt-get install espeak
```

### No sound / Voice not working
1. **Check system volume** - Make sure it's not muted
2. **Check checkbox** - "🔊 Read translation aloud" should be checked
3. **Test system TTS** - Try other TTS apps to verify it works
4. **Restart app** - Close and reopen the application

### Voice sounds robotic
- This is normal for system TTS
- Different operating systems have different voice quality
- Windows 10/11 has better voices than older versions

### Want a different voice?
```python
# Add this code to see available voices:
voices = self.tts_engine.getProperty('voices')
for voice in voices:
    print(voice.name)

# Set a specific voice:
self.tts_engine.setProperty('voice', voices[1].id)  # Try different indices
```

---

## 🎨 UI Elements

### Checkbox Location
```
┌─────────────────────────────────────┐
│  [▶ Start Collecting Signs]        │
│  ☑ 🔊 Read translation aloud        │  ← TTS Toggle
│  [🗑️ Clear All]                     │
└─────────────────────────────────────┘
```

### Status Messages
- **"Translation complete"** - TTS is speaking
- **"Signs displayed (no AI)"** - TTS speaking simple translation
- **"No signs detected"** - No TTS (nothing to speak)

---

## 💡 Tips

### For Best TTS Experience:
1. **Use Gemma AI** - Natural sentences sound better than word lists
2. **Complete sentences** - "Hello! Good morning!" sounds better than "HELLO GOOD MORNING"
3. **Adjust volume** - Set comfortable level for your environment
4. **Quiet environment** - Easier to hear the translation

### For Presentations:
1. **Check TTS before starting** - Make sure it works
2. **Adjust speed** - Slower for audiences
3. **Increase volume** - Louder for larger rooms
4. **Test with sample signs** - Verify voice quality

---

## 🆚 With vs Without TTS

### Without TTS (Old):
```
1. Collect signs
2. Stop & Translate
3. Read text on screen
4. Manual communication
```

### With TTS (New):
```
1. Collect signs
2. Stop & Translate
3. Hear translation automatically! 🔊
4. Hands-free communication
```

---

## 🎓 Technical Details

### How It Works:
1. Translation is generated (text)
2. Text is sent to TTS engine
3. TTS runs in separate thread (non-blocking)
4. Audio is played through system speakers
5. UI remains responsive

### Thread Safety:
- TTS runs in background thread
- Doesn't block UI or video processing
- Multiple translations can queue up

### Supported Platforms:
- ✅ Windows (SAPI5)
- ✅ macOS (NSSpeechSynthesizer)
- ✅ Linux (eSpeak)

---

## 📊 Feature Summary

| Feature | Status |
|---------|--------|
| **Automatic Speech** | ✅ Yes |
| **Toggle On/Off** | ✅ Checkbox |
| **Offline** | ✅ No internet needed |
| **Free** | ✅ No API costs |
| **Adjustable** | ✅ Speed & volume |
| **Multi-platform** | ✅ Win/Mac/Linux |

---

## 🎉 Ready to Use!

1. **Install**: `pip install pyttsx3`
2. **Run app**: `python fsl_translator_app.py`
3. **Collect signs**: Click "Start Collecting Signs"
4. **Listen**: Click "Stop & Translate" and hear it! 🔊

---

**Your translations now have a voice! 🎤**

# 📹 How the FSL Translator Works

> [!NOTE]
> **Gemma AI integration is planned for a future release.** The sections below 
> describe the intended AI-powered translation workflow. The current version 
> uses a local rule-based sentence builder that works fully offline.

## Camera & Detection Behavior

### 🎥 Camera: Always On
- **Starts automatically** when you open the app
- **Always running** - continuously processing video
- **Always detecting** - model is always analyzing signs
- **Never stops** - runs until you close the app

### 🤖 Sign Collection: On Demand
- **Start button** - Begin collecting detected signs
- **Stop button** - Stop collecting and translate
- **AI translation** - Only happens when you click "Stop & Translate"

---

## 🔄 Workflow

### When App Opens
```
1. App starts
2. Camera activates automatically
3. Video feed appears
4. Model is detecting signs (but not collecting them)
5. Status: "Camera active - Ready"
```

### When You Click "Start Collecting Signs"
```
1. Button changes to "Stop & Translate"
2. Status: "Collecting signs..."
3. Detected signs appear in "Detected Signs" box
4. Signs accumulate: HELLO → GOOD → MORNING
5. Camera and detection continue running
```

### When You Click "Stop & Translate"
```
1. Button changes back to "Start Collecting Signs"
2. Status: "Generating translation..."
3. Gemma AI processes the collected signs
4. Natural sentence appears in "Translation" box
5. Camera and detection continue running
6. Ready to start collecting again
```

---

## 🎯 Key Points

### Camera is ALWAYS:
✓ Running  
✓ Showing video feed  
✓ Detecting landmarks  
✓ Running predictions  

### Button Controls ONLY:
✓ When to start collecting signs  
✓ When to stop and translate  
✓ When to send to Gemma AI  

### This Means:
- **No startup delay** - camera is ready immediately
- **Continuous monitoring** - always watching for signs
- **Selective collection** - you choose when to record
- **Multiple translations** - collect → translate → collect → translate

---

## 📊 State Diagram

```
┌─────────────────────────────────────────────────┐
│  APP STARTS                                     │
│  ↓                                              │
│  Camera Activates (Always On)                  │
│  ↓                                              │
│  Video Processing Loop (Continuous)            │
│  ├─ Capture frame                              │
│  ├─ Extract landmarks                          │
│  ├─ Run prediction                             │
│  └─ Display video                              │
│                                                 │
│  ┌──────────────────────────────────────┐      │
│  │  User clicks "Start Collecting"     │      │
│  │  ↓                                   │      │
│  │  is_collecting = True                │      │
│  │  ↓                                   │      │
│  │  Signs are added to list             │      │
│  │  ↓                                   │      │
│  │  User clicks "Stop & Translate"     │      │
│  │  ↓                                   │      │
│  │  is_collecting = False               │      │
│  │  ↓                                   │      │
│  │  Gemma generates sentence            │      │
│  │  ↓                                   │      │
│  │  Ready to collect again              │      │
│  └──────────────────────────────────────┘      │
│                                                 │
│  Camera continues running throughout           │
└─────────────────────────────────────────────────┘
```

---

## 💡 Example Usage

### Scenario 1: Single Translation
```
1. App opens → Camera on
2. Click "Start Collecting Signs"
3. Sign: HELLO → GOOD → MORNING
4. Click "Stop & Translate"
5. Result: "Hello! Good morning!"
6. Camera still running
```

### Scenario 2: Multiple Translations
```
1. App opens → Camera on
2. Click "Start Collecting Signs"
3. Sign: HELLO
4. Click "Stop & Translate"
5. Result: "Hello!"

6. Click "Start Collecting Signs" again
7. Sign: HOW → ARE → YOU
8. Click "Stop & Translate"
9. Result: "How are you?"

Camera never stopped!
```

### Scenario 3: Clear and Restart
```
1. Collecting signs: HELLO → GOOD → MORNING
2. Oops, made a mistake!
3. Click "Clear All"
4. Signs cleared, camera still running
5. Click "Start Collecting Signs"
6. Start over with new signs
```

---

## 🎮 Button Behavior

### "Start Collecting Signs" (Green)
- **What it does**: Begins adding detected signs to the list
- **Camera**: Already running, continues running
- **Detection**: Already happening, now saves results
- **Status**: Changes to "Collecting signs..."

### "Stop & Translate" (Red)
- **What it does**: Stops collecting and generates translation
- **Camera**: Continues running
- **Detection**: Continues happening, but not saved
- **Status**: Changes to "Translation complete"

### "Clear All" (Red)
- **What it does**: Clears signs and translation
- **Camera**: Continues running
- **Detection**: Continues happening
- **Collection**: Continues if button was "Stop & Translate"

---

## 🔍 Technical Details

### Video Processing Loop
```python
while video_running:  # Always True until app closes
    1. Capture frame
    2. Process with MediaPipe
    3. Extract landmarks
    4. Run LSTM prediction
    5. Check stability
    6. IF is_collecting:
           Add sign to list
       ELSE:
           Ignore (but keep detecting)
    7. Display frame
    8. Repeat
```

### Collection State
```python
is_collecting = False  # Default
↓
User clicks "Start Collecting Signs"
↓
is_collecting = True
↓
Signs are added to detected_signs list
↓
User clicks "Stop & Translate"
↓
is_collecting = False
↓
Gemma translates detected_signs
↓
Ready to start collecting again
```

---

## ✨ Benefits of This Design

### 1. **No Startup Delay**
- Camera is ready when you are
- No waiting for camera to initialize

### 2. **Continuous Monitoring**
- Always watching for signs
- Can see yourself and landmarks at all times

### 3. **Flexible Collection**
- Start and stop as needed
- Multiple translations in one session

### 4. **Better User Experience**
- Visual feedback always available
- Clear when collection is active
- Easy to restart

### 5. **Efficient**
- Camera only initialized once
- No repeated start/stop overhead
- Smooth, continuous operation

---

## 🎯 Summary

| Feature | Behavior |
|---------|----------|
| **Camera** | Always on from app start |
| **Video Feed** | Always displaying |
| **Sign Detection** | Always running |
| **Sign Collection** | Only when button clicked |
| **AI Translation** | Only when "Stop & Translate" clicked |
| **Clear** | Clears signs, camera continues |
| **Close App** | Stops camera and exits |

---

**The camera is your window - always open, always watching. The button is your recorder - you control when to capture! 📹**

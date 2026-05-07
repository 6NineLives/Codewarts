# ASL Translator Web App

## Setup

1. Copy your `asl_model.h5` into this folder
2. Install dependencies:
```
pip install -r requirements.txt
```
3. Run the app:
```
python app.py
```
4. Open your browser at **http://localhost:5000**

## Usage
- Click **Start Camera**
- Place your hand inside the green guide box
- The app predicts your ASL letter in real time
- Letters that hold steady for 3 frames get added to the history strip

## Tips for better accuracy
- Use a **dark background** behind your hand
- Make sure your hand is **well lit**
- Keep your hand **centered** in the green box

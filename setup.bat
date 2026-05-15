@echo off
echo ================================================
echo  Codewarts FSL Translator - Environment Setup
echo ================================================
echo.

set "SCRIPT_DIR=%~dp0"

REM --- Step 1: Check Python 3.11 is available ---
echo [1/4] Checking Python 3.11...
py -3.11 --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python 3.11 not found.
    echo.
    echo Install it from: https://www.python.org/downloads/release/python-3119/
    echo Make sure to check "Add Python to PATH" during install.
    echo.
    pause
    exit /b 1
)
echo       Found: 
py -3.11 --version
echo.

REM --- Step 2: Create virtual environment ---
echo [2/4] Creating virtual environment...
if exist "%SCRIPT_DIR%venv" (
    echo       venv already exists. Skipping creation.
    echo       To recreate, delete the venv folder and run setup again.
) else (
    py -3.11 -m venv "%SCRIPT_DIR%venv"
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
    echo       Created venv successfully.
)
echo.

REM --- Step 3: Install dependencies ---
echo [3/4] Installing dependencies...
call "%SCRIPT_DIR%venv\Scripts\activate.bat"
python -m pip install --upgrade pip --quiet
pip install -r "%SCRIPT_DIR%requirements.txt"
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies.
    echo       Check your internet connection and try again.
    pause
    exit /b 1
)
echo       All dependencies installed.
echo.

REM --- Step 4: Verify model files ---
echo [4/4] Verifying model files...
set "MODELS_OK=1"

if not exist "%SCRIPT_DIR%models\fsl_105_model.h5" (
    echo       [MISSING] models\fsl_105_model.h5
    set "MODELS_OK=0"
)
if not exist "%SCRIPT_DIR%models\action_labels.npy" (
    echo       [MISSING] models\action_labels.npy
    set "MODELS_OK=0"
)

if "%MODELS_OK%"=="0" (
    echo.
    echo [WARNING] Some model files are missing.
    echo          The app will not work without them.
    echo          Contact a team member to obtain the model files.
) else (
    echo       All model files present.
)

echo.
echo ================================================
echo  Setup Complete!
echo ================================================
echo.
echo  To run the app:
echo    Double-click run_app.bat
echo    OR: venv\Scripts\activate ^& python fsl_translator_app.py
echo.
pause

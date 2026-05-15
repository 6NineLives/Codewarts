@echo off
echo ========================================
echo  Filipino Sign Language Translator V2
echo  Using Model: fsl_105_model_2.h5
echo ========================================
echo.

set "SCRIPT_DIR=%~dp0"
set "VENV_ACTIVATE=%SCRIPT_DIR%venv\Scripts\activate.bat"

if not exist "%VENV_ACTIVATE%" (
    echo [ERROR] Virtual environment not found at: %SCRIPT_DIR%venv
    echo.
    echo Please run setup.bat first, or create it manually:
    echo   py -3.11 -m venv venv
    echo   venv\Scripts\activate
    echo   pip install -r requirements.txt
    echo.
    pause
    exit /b 1
)

call "%VENV_ACTIVATE%"
echo Starting application...
echo.
python "%SCRIPT_DIR%fsl_translator_app_v2.py"
pause

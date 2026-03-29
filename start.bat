@echo off
echo ========================================
echo   Gemini NanoBanana - Starting...
echo ========================================
echo.

REM Check if .venv exists, if not create it
if not exist ".venv" (
    echo [1/4] Creating virtual environment...
    python -m venv .venv
)

REM Activate virtual environment
echo [2/4] Activating virtual environment...
call .venv\Scripts\activate.bat

REM Install Python dependencies
echo [3/4] Installing Python dependencies...
pip install -q -r requirements.txt

REM Start backend in background
echo [4/4] Starting services...
echo.
echo ┌─────────────────────────────────────────┐
echo │  Backend: python main.py (port 9090)    │
echo │  Frontend: npm run dev (port 5173)      │
echo └─────────────────────────────────────────┘
echo.

REM Start backend as background process
start /B cmd /c "python main.py"

REM Wait for backend to initialize
timeout /t 2 /nobreak >nul

REM Start frontend in current terminal
cd multimodal-client-vite
npm run dev

REM Cleanup on exit (user presses Ctrl+C)
:cleanup
echo.
echo Stopping services...
taskkill /F /FI "WINDOWTITLE eq python main.py" 2>nul
echo Done.
pause

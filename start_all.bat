@echo off
echo ========================================================================
echo    🧬 GeneVision - Complete System Startup
echo ========================================================================
echo.
echo This will start all 3 services:
echo   1. RAG API (Port 8000) - Gene search backend
echo   2. Image Backend (Port 3001) - Image generation
echo   3. Frontend (Port 5173) - Web interface
echo.
echo Make sure you have:
echo   ✅ Vector database built (run check_current_db.py to verify)
echo   ✅ Conda environment 'genevision' ready
echo   ✅ Node.js installed
echo.
pause

echo.
echo ========================================================================
echo 🔍 Checking prerequisites...
echo ========================================================================
echo.

REM Check if database exists
if not exist "rag-system\data\processed\chroma_db\chroma.sqlite3" (
    echo ❌ Vector database not found!
    echo    Please build it first using: cd rag-system ^&^& build_demo.bat
    pause
    exit /b 1
)

echo ✅ Vector database found
echo.

echo ========================================================================
echo 🚀 Starting services...
echo ========================================================================
echo.
echo Opening 3 terminal windows:
echo   - Terminal 1: RAG API (Port 8000)
echo   - Terminal 2: Image Backend (Port 3001)
echo   - Terminal 3: Frontend (Port 5173)
echo.
echo Press Ctrl+C in each terminal to stop the respective service
echo.
pause

REM Start RAG API
echo Starting RAG API...
start cmd /k "cd rag-system && conda activate genevision && echo ======================================== && echo RAG API Server (Port 8000) && echo ======================================== && echo. && python api\main.py"

timeout /t 5 /nobreak > nul

REM Start Image Backend
echo Starting Image Backend...
start cmd /k "cd backend && echo ======================================== && echo Image Backend (Port 3001) && echo ======================================== && echo. && node server.js"

timeout /t 3 /nobreak > nul

REM Start Frontend
echo Starting Frontend...
start cmd /k "cd frontend && echo ======================================== && echo Frontend (Port 5173) && echo ======================================== && echo. && npm run dev"

echo.
echo ========================================================================
echo ✅ All services are starting!
echo ========================================================================
echo.
echo 🌐 Access URLs:
echo   - Frontend:     http://localhost:5173
echo   - RAG API Docs: http://localhost:8000/docs
echo   - Image Health: http://localhost:3001/health
echo.
echo 📝 What to do next:
echo   1. Wait 10-15 seconds for all services to start
echo   2. Open your browser: http://localhost:5173
echo   3. Try queries like: "muscular mouse" or "obese mouse"
echo.
echo To stop all services:
echo   - Press Ctrl+C in each terminal window
echo   - Or run: stop.sh (if available)
echo.
pause

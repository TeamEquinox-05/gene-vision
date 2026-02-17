@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

echo ============================================================
echo GeneVision RAG - Complete Setup and Database Build
echo ============================================================
echo.

REM Set paths
set CONDA_PATH=C:\Users\uday0\miniconda3
set PYTHON_EXE=%CONDA_PATH%\envs\genevision\python.exe

echo Step 1: Installing required packages...
echo --------------------------------------------------------
"%PYTHON_EXE%" -m pip install --quiet --upgrade pip
"%PYTHON_EXE%" -m pip install --quiet chromadb sentence-transformers fastapi uvicorn pydantic tqdm numpy langchain langchain-core langchain-community transformers torch

echo.
echo Step 2: Verifying installation...
echo --------------------------------------------------------
"%PYTHON_EXE%" -c "import chromadb; import sentence_transformers; import fastapi; print('All packages installed successfully!')"
if ERRORLEVEL 1 (
    echo ERROR: Package verification failed!
    pause
    exit /b 1
)

echo.
echo Step 3: Building vector database...
echo --------------------------------------------------------
echo This will process 23,000+ genes with 390,000+ phenotype associations
echo Estimated time: 15-20 minutes
echo.
"%PYTHON_EXE%" scripts\build_vector_db.py

if ERRORLEVEL 1 (
    echo.
    echo ERROR: Database build failed!
    pause
    exit /b 1
)

echo.
echo ============================================================
echo SUCCESS! GeneVision RAG is ready!
echo ============================================================
echo.
echo To start the API server, run:
echo    "%PYTHON_EXE%" api\main.py
echo.
echo Or use:
echo    start_api.bat
echo.
pause

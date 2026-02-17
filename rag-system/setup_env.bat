@echo off
REM ##############################################################################
REM GeneVision RAG System - Conda Environment Setup Script (Windows)
REM 
REM This script sets up a complete conda environment for the production RAG system
REM with all required dependencies for batch processing and full gene database
REM ##############################################################################

setlocal enabledelayedexpansion

echo ==========================================================================
echo 🧬 GeneVision RAG System - Environment Setup (Windows)
echo ==========================================================================
echo.

REM Configuration
set ENV_NAME=genevision-rag
set PYTHON_VERSION=3.11

echo 📋 Configuration:
echo    Environment name: %ENV_NAME%
echo    Python version: %PYTHON_VERSION%
echo.

REM Check if conda is installed
where conda >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: conda is not installed or not in PATH
    echo    Please install Anaconda or Miniconda first
    echo    Download from: https://docs.conda.io/en/latest/miniconda.html
    exit /b 1
)

echo ✅ Found conda
conda --version
echo.

REM Check if environment already exists
conda env list | findstr /C:"%ENV_NAME%" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  Environment '%ENV_NAME%' already exists
    set /p REPLY="   Do you want to remove and recreate it? (y/N): "
    if /i "!REPLY!"=="y" (
        echo 🗑️  Removing existing environment...
        call conda env remove -n %ENV_NAME% -y
        echo ✅ Environment removed
    ) else (
        echo ❌ Setup cancelled
        exit /b 1
    )
)

echo.
echo ==========================================================================
echo 📦 STEP 1: Creating conda environment
echo ==========================================================================
echo.

call conda create -n %ENV_NAME% python=%PYTHON_VERSION% -y

echo.
echo ==========================================================================
echo 📥 STEP 2: Installing Python dependencies
echo ==========================================================================
echo.

REM Activate environment and install packages
call conda activate %ENV_NAME%

echo Installing core dependencies...
python -m pip install --upgrade pip

echo.
echo Installing RAG system dependencies from requirements.txt...
pip install -r requirements.txt

echo.
echo ==========================================================================
echo 🎯 STEP 3: Verifying installation
echo ==========================================================================
echo.

python -c "import sys; import chromadb; import sentence_transformers; import fastapi; print('✅ Python version:', sys.version); print('✅ ChromaDB installed:', chromadb.__version__); print('✅ Sentence Transformers installed:', sentence_transformers.__version__); print('✅ FastAPI installed:', fastapi.__version__); print(''); print('✨ All dependencies installed successfully!')"

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Dependency verification failed
    exit /b 1
)

echo.
echo ==========================================================================
echo ✅ Environment setup complete!
echo ==========================================================================
echo.
echo Next steps:
echo.
echo   1. Activate the environment:
echo      conda activate %ENV_NAME%
echo.
echo   2. Build the full gene database (PRODUCTION MODE):
echo      python scripts/build_vector_db.py
echo.
echo      This will process ALL genes from MGI (~250k+ phenotype pairs)
echo      Expected time: 10-20 minutes depending on your hardware
echo.
echo   3. OR build demo database (DEMO MODE - faster):
echo      python scripts/build_vector_db.py --curated
echo.
echo      This will only process 10 curated genes (~100 phenotype pairs)
echo      Expected time: 1-2 minutes
echo.
echo   4. Test the RAG system:
echo      python scripts/test_queries.py
echo.
echo   5. Start the API server:
echo      cd .. ^&^& uvicorn api.main:app --host 0.0.0.0 --port 8000
echo.
echo ==========================================================================
echo.

endlocal

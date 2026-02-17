@echo off
REM Build GeneVision RAG Database
echo ========================================
echo Building GeneVision RAG Database
echo ========================================
echo.

REM Initialize conda for this script
call C:\Users\uday0\miniconda3\Scripts\activate.bat

REM Check if genevision-rag environment exists, if not use genevision
conda env list | findstr "genevision-rag" >nul
if %ERRORLEVEL% EQU 0 (
    echo Using genevision-rag environment...
    call conda activate genevision-rag
) else (
    conda env list | findstr "genevision" >nul
    if %ERRORLEVEL% EQU 0 (
        echo Using genevision environment...
        call conda activate genevision
    ) else (
        echo ERROR: No genevision environment found!
        echo Please run setup_env.bat first
        pause
        exit /b 1
    )
)

echo.
echo Checking Python installation...
python --version
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python not found in conda environment
    echo Please run setup_env.bat first
    pause
    exit /b 1
)

echo.
echo Installing required packages if needed...
pip install -q chromadb sentence-transformers fastapi uvicorn pydantic tqdm numpy 2>nul

echo.
echo ========================================
echo Starting Database Build Process
echo ========================================
echo.
echo This will take approximately 15-20 minutes
echo Processing 23,000+ genes with 390,000+ phenotype associations
echo.

python scripts\build_vector_db.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Database build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Database built successfully!
echo ========================================
echo.
echo Next steps:
echo   1. Start RAG API: python api\main.py
echo   2. Start Image Backend: cd ..\backend ^&^& node server.js
echo   3. Start Frontend: cd ..\frontend ^&^& npm run dev
echo.
pause

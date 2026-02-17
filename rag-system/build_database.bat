@echo off
echo ========================================================================
echo    GeneVision RAG - Vector Database Builder (16GB RAM Optimized)
echo ========================================================================
echo.
echo This will build the complete vector database with ALL genes (~300K+ associations)
echo Processing time: 20-30 minutes depending on your hardware
echo.
echo RAM OPTIMIZATION: Using smaller batches to prevent memory issues
echo   - Data batch size: 5000 (was 10000)
echo   - Embedding batch size: 50 (was 100)
echo.
echo TIP: Close other heavy applications (browsers, games) for best performance
echo.
echo Press Ctrl+C to pause at any time. You can resume later!
echo.
pause

echo.
echo Activating conda environment: genevision
call conda activate genevision

if errorlevel 1 (
    echo.
    echo ERROR: Could not activate conda environment 'genevision'
    echo Please create it first using: conda create -n genevision python=3.11
    echo Then install requirements: pip install -r requirements.txt
    pause
    exit /b 1
)

echo.
echo ========================================================================
echo Starting database build with RAM-optimized settings...
echo ========================================================================
echo.

python scripts\build_vector_db.py --batch-size 5000 --embedding-batch-size 50

if errorlevel 1 (
    echo.
    echo ========================================================================
    echo BUILD FAILED or INTERRUPTED
    echo ========================================================================
    echo.
    echo Don't worry! You can resume by running this script again.
    echo The system will automatically detect where it left off.
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================================================
echo BUILD COMPLETED SUCCESSFULLY!
echo ========================================================================
echo.
echo Your vector database is ready to use.
echo.
echo Next steps:
echo   1. Test queries: python scripts\test_queries.py
echo   2. Start API server: python api\main.py
echo   3. Or use the full start script: ..\start.sh
echo.
pause

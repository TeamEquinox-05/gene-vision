@echo off
echo ========================================================================
echo    GeneVision RAG - DEMO MODE (Curated Genes Only)
echo ========================================================================
echo.
echo This will build a DEMO database with only 10 curated genes
echo Perfect for testing, demos, and presentations!
echo.
echo Processing time: ~2-3 minutes
echo Documents: ~500 (instead of 389,752)
echo.
pause

echo.
echo Activating conda environment: genevision
call conda activate genevision

if errorlevel 1 (
    echo.
    echo ERROR: Could not activate conda environment 'genevision'
    pause
    exit /b 1
)

echo.
echo ========================================================================
echo Starting DEMO database build (Curated genes only)...
echo ========================================================================
echo.

python scripts\build_vector_db.py --curated --embedding-batch-size 50

if errorlevel 1 (
    echo.
    echo ========================================================================
    echo BUILD FAILED or INTERRUPTED
    echo ========================================================================
    pause
    exit /b 1
)

echo.
echo ========================================================================
echo DEMO DATABASE COMPLETED!
echo ========================================================================
echo.
echo Your demo database is ready with 10 curated genes.
echo This is perfect for presentations and testing!
echo.
echo Curated genes included:
echo   - Tyr (albinism)
echo   - Mc1r (coat color)
echo   - Kit (white spotting)
echo   - Lep (obesity)
echo   - Lepr (leptin receptor)
echo   - Cpe (late-onset obesity)
echo   - Pax6 (eye development)
echo   - Hoxd13 (polydactyly)
echo   - Mstn (muscle mass)
echo   - Trp53 (cancer susceptibility)
echo.
echo Next steps:
echo   1. Test queries: python scripts\test_queries.py
echo   2. Start API: python api\main.py
echo.
pause

@echo off
echo ========================================================================
echo    GeneVision RAG - Limited to 20,000 Documents
echo ========================================================================
echo.
echo This will build database with approximately 20,000 documents
echo Fast processing: ~15-20 minutes
echo.
pause

echo.
echo Activating conda environment: genevision
call conda activate genevision

echo.
echo ========================================================================
echo Building database with document limit...
echo ========================================================================
echo.

python scripts\build_limited_db.py 20000

echo.
pause

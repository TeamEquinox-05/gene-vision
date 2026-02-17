@echo off
echo ========================================================================
echo    GeneVision RAG - Top 1000 Genes Mode
echo ========================================================================
echo.
echo This will build database with TOP 1000 GENES by phenotype count
echo Balanced approach: Good coverage, reasonable processing time
echo.
echo Estimated documents: ~20,000-30,000
echo Processing time: ~30-45 minutes
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
echo Step 1: Filtering to top 1000 genes...
echo ========================================================================
echo.

python scripts\filter_top_genes.py 1000

if errorlevel 1 (
    echo ERROR: Filtering failed
    pause
    exit /b 1
)

echo.
echo ========================================================================
echo Step 2: Building vector database...
echo ========================================================================
echo.

REM Temporarily rename files
move data\processed\gene_phenotype_data.json data\processed\gene_phenotype_data_full.json
move data\processed\gene_phenotype_data_top1000.json data\processed\gene_phenotype_data.json

python scripts\build_vector_db.py --embedding-batch-size 50

REM Restore original file
move data\processed\gene_phenotype_data.json data\processed\gene_phenotype_data_top1000.json
move data\processed\gene_phenotype_data_full.json data\processed\gene_phenotype_data.json

echo.
echo ========================================================================
echo TOP 1000 GENES DATABASE COMPLETED!
echo ========================================================================
echo.
echo Your database includes the 1000 most important genes.
echo Perfect balance of coverage and performance!
echo.
pause

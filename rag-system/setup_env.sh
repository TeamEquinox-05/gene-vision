#!/bin/bash

###############################################################################
# GeneVision RAG System - Conda Environment Setup Script
# 
# This script sets up a complete conda environment for the production RAG system
# with all required dependencies for batch processing and full gene database
###############################################################################

set -e  # Exit on error

echo "=========================================================================="
echo "🧬 GeneVision RAG System - Environment Setup"
echo "=========================================================================="
echo ""

# Configuration
ENV_NAME="genevision-rag"
PYTHON_VERSION="3.11"

echo "📋 Configuration:"
echo "   Environment name: $ENV_NAME"
echo "   Python version: $PYTHON_VERSION"
echo ""

# Check if conda is installed
if ! command -v conda &> /dev/null; then
    echo "❌ Error: conda is not installed or not in PATH"
    echo "   Please install Anaconda or Miniconda first"
    echo "   Download from: https://docs.conda.io/en/latest/miniconda.html"
    exit 1
fi

echo "✅ Found conda: $(conda --version)"
echo ""

# Check if environment already exists
if conda env list | grep -q "^$ENV_NAME "; then
    echo "⚠️  Environment '$ENV_NAME' already exists"
    read -p "   Do you want to remove and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Removing existing environment..."
        conda env remove -n $ENV_NAME -y
        echo "✅ Environment removed"
    else
        echo "❌ Setup cancelled"
        exit 1
    fi
fi

echo ""
echo "=========================================================================="
echo "📦 STEP 1: Creating conda environment"
echo "=========================================================================="
echo ""

conda create -n $ENV_NAME python=$PYTHON_VERSION -y

echo ""
echo "=========================================================================="
echo "📥 STEP 2: Installing Python dependencies"
echo "=========================================================================="
echo ""

# Activate environment and install packages
source "$(conda info --base)/etc/profile.d/conda.sh"
conda activate $ENV_NAME

echo "Installing core dependencies..."
pip install --upgrade pip

echo ""
echo "Installing RAG system dependencies from requirements.txt..."
pip install -r requirements.txt

echo ""
echo "=========================================================================="
echo "🎯 STEP 3: Verifying installation"
echo "=========================================================================="
echo ""

python -c "
import sys
print('✅ Python version:', sys.version)

try:
    import chromadb
    print('✅ ChromaDB installed:', chromadb.__version__)
except ImportError as e:
    print('❌ ChromaDB installation failed:', e)
    sys.exit(1)

try:
    import sentence_transformers
    print('✅ Sentence Transformers installed:', sentence_transformers.__version__)
except ImportError as e:
    print('❌ Sentence Transformers installation failed:', e)
    sys.exit(1)

try:
    import fastapi
    print('✅ FastAPI installed:', fastapi.__version__)
except ImportError as e:
    print('❌ FastAPI installation failed:', e)
    sys.exit(1)

print('')
print('✨ All dependencies installed successfully!')
"

echo ""
echo "=========================================================================="
echo "✅ Environment setup complete!"
echo "=========================================================================="
echo ""
echo "Next steps:"
echo ""
echo "  1. Activate the environment:"
echo "     conda activate $ENV_NAME"
echo ""
echo "  2. Build the full gene database (PRODUCTION MODE):"
echo "     python scripts/build_vector_db.py"
echo ""
echo "     This will process ALL genes from MGI (~250k+ phenotype pairs)"
echo "     Expected time: 10-20 minutes depending on your hardware"
echo ""
echo "  3. OR build demo database (DEMO MODE - faster):"
echo "     python scripts/build_vector_db.py --curated"
echo ""
echo "     This will only process 10 curated genes (~100 phenotype pairs)"
echo "     Expected time: 1-2 minutes"
echo ""
echo "  4. Test the RAG system:"
echo "     python scripts/test_queries.py"
echo ""
echo "  5. Start the API server:"
echo "     cd .. && uvicorn api.main:app --host 0.0.0.0 --port 8000"
echo ""
echo "=========================================================================="
echo ""

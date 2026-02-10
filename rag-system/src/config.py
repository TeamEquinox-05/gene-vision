"""
Configuration settings for GeneVision RAG System
"""

import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
PROCESSED_DATA_DIR = DATA_DIR / "processed"

# Data files
MGI_PHENOGENOMP_FILE = DATA_DIR / "MGI_PhenoGenoMP.rpt.txt"
PHENOTYPE_VOCAB_FILE = DATA_DIR / "VOC_MammalianPhenotype.rpt.txt"
PROCESSED_DATA_FILE = PROCESSED_DATA_DIR / "gene_phenotype_data.json"
CURATED_GENES_FILE = PROCESSED_DATA_DIR / "curated_genes.json"

# ChromaDB settings
CHROMA_DB_PATH = PROCESSED_DATA_DIR / "chroma_db"
COLLECTION_NAME = "gene_phenotypes"

# Embedding model
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# Query settings
DEFAULT_TOP_K = 5
MAX_TOP_K = 20

# API settings
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))

# Ensure directories exist
PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)

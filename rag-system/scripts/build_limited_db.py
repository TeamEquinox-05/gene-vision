#!/usr/bin/env python3
"""
Build vector database with limited number of documents
"""

import sys
import json
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from vector_store import VectorStore
from config import PROCESSED_DATA_FILE, CHROMA_DB_PATH

def build_limited_database(max_docs: int = 20000, embedding_batch_size: int = 50):
    """Build database with limited documents"""
    
    print("\n" + "=" * 70)
    print(f"🚀 Building Database with Max {max_docs:,} Documents")
    print("=" * 70 + "\n")
    
    # Load processed data
    print(f"📖 Loading processed data...")
    with open(PROCESSED_DATA_FILE, "r", encoding="utf-8") as f:
        gene_data = json.load(f)
    
    print(f"✅ Loaded data for {len(gene_data):,} genes")
    
    # Sort genes by phenotype count and take top genes until we hit limit
    sorted_genes = sorted(
        gene_data.items(),
        key=lambda x: len(x[1].get("phenotypes", [])),
        reverse=True
    )
    
    limited_gene_data = {}
    total_phenotypes = 0
    
    for gene_sym, gene_record in sorted_genes:
        phenotypes = gene_record.get("phenotypes", [])
        
        if total_phenotypes + len(phenotypes) <= max_docs:
            limited_gene_data[gene_sym] = gene_record
            total_phenotypes += len(phenotypes)
        elif total_phenotypes < max_docs:
            # Take partial phenotypes from this gene to reach limit
            remaining = max_docs - total_phenotypes
            limited_record = gene_record.copy()
            limited_record["phenotypes"] = phenotypes[:remaining]
            limited_gene_data[gene_sym] = limited_record
            total_phenotypes += remaining
            break
        else:
            break
    
    print(f"\n📊 Selected {len(limited_gene_data):,} genes")
    print(f"📊 Total documents: {total_phenotypes:,}")
    
    # Initialize vector store
    vector_store = VectorStore()
    
    # Reset collection
    vector_store.reset_collection()
    
    # Ingest limited data
    num_docs = vector_store.ingest_gene_data(
        limited_gene_data, 
        batch_size=embedding_batch_size
    )
    
    print("\n" + "=" * 70)
    print(f"✨ Limited database build complete!")
    print(f"  📊 Indexed {num_docs:,} documents")
    print(f"  🧬 Covering {len(limited_gene_data):,} genes")
    print(f"  📁 Saved to: {CHROMA_DB_PATH}")
    print("=" * 70 + "\n")
    
    return num_docs


if __name__ == "__main__":
    max_docs = int(sys.argv[1]) if len(sys.argv) > 1 else 20000
    build_limited_database(max_docs, embedding_batch_size=50)

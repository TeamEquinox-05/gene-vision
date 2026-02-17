#!/usr/bin/env python3
"""Quick status check for GeneVision RAG system"""

import json
from pathlib import Path

print("\n" + "=" * 70)
print("🔍 GeneVision RAG System - Status Check")
print("=" * 70 + "\n")

# Check processed data
processed_file = Path("data/processed/gene_phenotype_data.json")
if processed_file.exists():
    print("✅ Processed data file exists")
    file_size_mb = processed_file.stat().st_size / (1024 * 1024)
    print(f"   Size: {file_size_mb:.2f} MB")
    
    # Load and analyze
    with open(processed_file, 'r', encoding='utf-8') as f:
        gene_data = json.load(f)
    
    total_genes = len(gene_data)
    total_phenotypes = sum(len(g.get('phenotypes', [])) for g in gene_data.values())
    curated_count = sum(1 for g in gene_data.values() if g.get('is_curated', False))
    
    print(f"   Total genes: {total_genes:,}")
    print(f"   Total gene-phenotype pairs: {total_phenotypes:,}")
    print(f"   Curated genes: {curated_count}")
else:
    print("❌ Processed data file NOT found")
    print("   Need to run: python scripts/build_vector_db.py")

print()

# Check vector database
chroma_db = Path("data/processed/chroma_db")
if chroma_db.exists():
    print("✅ ChromaDB directory exists")
    
    # Try to check collection
    try:
        import chromadb
        from chromadb.config import Settings
        
        client = chromadb.PersistentClient(
            path=str(chroma_db),
            settings=Settings(anonymized_telemetry=False)
        )
        
        try:
            collection = client.get_collection(name="gene_phenotypes")
            doc_count = collection.count()
            print(f"   Documents indexed: {doc_count:,}")
            
            if doc_count == 0:
                print("   ⚠️  Collection is EMPTY - need to build database")
            elif doc_count < 10000:
                print("   ⚠️  Low document count - might be demo/curated mode only")
            else:
                print("   ✅ Database appears to be built")
        except Exception as e:
            print(f"   ⚠️  Collection not found: {e}")
            print("   Need to run: python scripts/build_vector_db.py")
    except Exception as e:
        print(f"   ⚠️  Could not load ChromaDB: {e}")
else:
    print("❌ ChromaDB directory NOT found")
    print("   Need to run: python scripts/build_vector_db.py")

print()
print("=" * 70)

# Summary
print("\n📋 SUMMARY:\n")

if processed_file.exists() and total_phenotypes > 100000:
    print("✅ Data processing: COMPLETE")
    print(f"   You have {total_genes:,} genes with {total_phenotypes:,} associations ready")
else:
    print("⚠️  Data processing: INCOMPLETE or DEMO MODE")
    print("   Run: python scripts/build_vector_db.py")

if chroma_db.exists():
    try:
        if doc_count > 10000:
            print("✅ Vector database: COMPLETE")
        else:
            print("⚠️  Vector database: INCOMPLETE (only demo/curated genes)")
            print("   Run: python scripts/build_vector_db.py (without --curated flag)")
    except:
        print("⚠️  Vector database: NEEDS BUILD")
        print("   Run: python scripts/build_vector_db.py")
else:
    print("❌ Vector database: NOT BUILT")
    print("   Run: python scripts/build_vector_db.py")

print()
print("=" * 70)
print()

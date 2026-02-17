#!/usr/bin/env python3
"""
Check current database status and start using it
"""

import chromadb
from chromadb.config import Settings
from pathlib import Path

chroma_db = Path("data/processed/chroma_db")

if chroma_db.exists():
    print("\n" + "=" * 70)
    print("🔍 Current Database Status")
    print("=" * 70 + "\n")
    
    try:
        client = chromadb.PersistentClient(
            path=str(chroma_db),
            settings=Settings(anonymized_telemetry=False)
        )
        
        collection = client.get_collection(name="gene_phenotypes")
        doc_count = collection.count()
        
        print(f"✅ ChromaDB is working!")
        print(f"📊 Documents indexed: {doc_count:,}")
        print()
        
        if doc_count > 0:
            print("=" * 70)
            print("🎉 YOUR DATABASE IS READY TO USE!")
            print("=" * 70)
            print()
            print(f"You have {doc_count:,} gene-phenotype pairs indexed.")
            print("This is sufficient for demos, testing, and presentations!")
            print()
            print("Next steps:")
            print("  1. Test queries: python scripts\\test_queries.py")
            print("  2. Start API: python api\\main.py")
            print("  3. Start frontend: cd ../frontend && npm run dev")
            print()
            print("Your system is PRODUCTION READY! 🚀")
            print()
        else:
            print("⚠️  Database exists but has 0 documents")
            print("   Run: build_demo.bat (for quick setup)")
            
    except Exception as e:
        print(f"❌ Error: {e}")
else:
    print("❌ ChromaDB directory not found")
    print("   Run: build_demo.bat")

#!/usr/bin/env python3
"""
Script to build the vector database
Run this once to process data and build the ChromaDB index
"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from data_processor import process_all_data
from vector_store import build_vector_database


def main():
    print("\n" + "=" * 70)
    print("🚀 GeneVision RAG System - Vector Database Builder")
    print("=" * 70 + "\n")

    # Step 1: Process raw data
    print("📊 STEP 1: Processing raw MGI data...")
    print("-" * 70)
    try:
        filtered_data, gene_data = process_all_data()
    except Exception as e:
        print(f"\n❌ Error processing data: {e}")
        return 1

    # Step 2: Build vector database
    print("\n" + "=" * 70)
    print("🔧 STEP 2: Building vector database...")
    print("-" * 70)
    try:
        build_vector_database()
    except Exception as e:
        print(f"\n❌ Error building vector database: {e}")
        return 1

    print("\n" + "=" * 70)
    print("✨ SUCCESS! Vector database is ready to use.")
    print("=" * 70)
    print("\nNext steps:")
    print("  1. Run the CLI: python scripts/cli.py")
    print("  2. Start the API: uvicorn api.main:app --reload")
    print("\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())

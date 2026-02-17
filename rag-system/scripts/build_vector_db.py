#!/usr/bin/env python3
"""
Script to build the vector database with batch processing
Run this once to process data and build the ChromaDB index

Production Mode: Processes ALL genes from MGI database
Demo Mode: Only processes curated genes (10 genes) for quick testing
"""

import sys
import argparse
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from data_processor import process_all_data
from vector_store import build_vector_database


def main():
    parser = argparse.ArgumentParser(
        description="Build GeneVision RAG vector database"
    )
    parser.add_argument(
        "--curated",
        action="store_true",
        help="Build database with only curated genes (demo mode)",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=10000,
        help="Batch size for processing records (default: 10000)",
    )
    parser.add_argument(
        "--embedding-batch-size",
        type=int,
        default=100,
        help="Batch size for generating embeddings (default: 100)",
    )
    args = parser.parse_args()

    print("\n" + "=" * 70)
    print("🚀 GeneVision RAG System - Vector Database Builder")
    if args.curated:
        print("   MODE: Demo (Curated Genes Only)")
    else:
        print("   MODE: Production (ALL Genes)")
    print("=" * 70 + "\n")

    # Step 1: Process raw data
    print("📊 STEP 1: Processing raw MGI data...")
    print("-" * 70)
    try:
        filtered_data, gene_data = process_all_data(
            curated_only=args.curated,
            batch_size=args.batch_size
        )
    except Exception as e:
        print(f"\n❌ Error processing data: {e}")
        import traceback
        traceback.print_exc()
        return 1

    # Step 2: Build vector database
    print("\n" + "=" * 70)
    print("🔧 STEP 2: Building vector database...")
    print("-" * 70)
    try:
        build_vector_database(batch_size=args.embedding_batch_size)
    except Exception as e:
        print(f"\n❌ Error building vector database: {e}")
        import traceback
        traceback.print_exc()
        return 1

    print("\n" + "=" * 70)
    print("✨ SUCCESS! Vector database is ready to use.")
    print("=" * 70)
    print("\nNext steps:")
    print("  1. Test queries: python scripts/test_queries.py")
    print("  2. Run CLI: python scripts/cli.py")
    print("  3. Start API: cd .. && uvicorn api.main:app --host 0.0.0.0 --port 8000")
    print("\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())

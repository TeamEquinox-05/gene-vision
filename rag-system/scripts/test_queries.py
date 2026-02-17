#!/usr/bin/env python3
"""
Test script with example queries
"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from rag_engine import GeneRAGEngine


def main():
    """Run test queries"""

    print("\n" + "=" * 70)
    print("🧪 GeneVision RAG System - Test Queries")
    print("=" * 70 + "\n")

    # Initialize engine
    print("⏳ Loading RAG engine...")
    engine = GeneRAGEngine()
    print("✅ Engine loaded!\n")

    # Test queries
    test_cases = [
        ("create a fat mouse", "Should return Lep, Lepr, Cpe"),
        ("albino mouse", "Should return Tyr"),
        ("white coat color", "Should return Tyr, Kit"),
        ("mouse without eyes", "Should return Pax6"),
        ("strong muscular mouse", "Should return Mstn"),
        ("extra toes", "Should return Hoxd13"),
        ("white spotting", "Should return Kit"),
    ]

    for query, expected in test_cases:
        print("=" * 70)
        print(f"🔍 Query: '{query}'")
        print(f"📝 Expected: {expected}")
        print("-" * 70)

        try:
            response = engine.query(query, top_k=3)

            print(
                f"✅ Found {response.total_results} genes in {response.search_metadata.retrieval_time_ms:.1f}ms\n"
            )

            for i, gene in enumerate(response.genes, 1):
                print(f"{i}. {gene.gene_symbol} ({gene.gene_name})")
                print(f"   Score: {gene.aggregate_score:.3f}")
                print(
                    f"   Top phenotype: {gene.phenotypes[0].phenotype_name if gene.phenotypes else 'N/A'}"
                )
                print()

        except Exception as e:
            print(f"❌ Error: {e}\n")

        print()

    print("=" * 70)
    print("✨ All tests complete!")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()

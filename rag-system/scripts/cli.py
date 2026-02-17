#!/usr/bin/env python3
"""
Interactive CLI for testing GeneVision RAG system
"""

import sys
import json
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from rag_engine import GeneRAGEngine
from config import CHROMA_DB_PATH


def print_header():
    """Print CLI header"""
    print("\n" + "=" * 70)
    print("🧬 GeneVision RAG System - Interactive CLI")
    print("=" * 70)
    print("\nQuery the genetic modification database using natural language.")
    print("Examples:")
    print("  • 'create a fat mouse'")
    print("  • 'albino mouse'")
    print("  • 'mouse without eyes'")
    print("  • 'white coat color'")
    print("\nCommands:")
    print("  • 'exit' or 'quit' - Exit the CLI")
    print("  • 'json' - Toggle JSON output mode")
    print("=" * 70 + "\n")


def display_results(response, show_json=False):
    """Display query results in a readable format"""

    if show_json:
        # JSON output
        print("\n" + json.dumps(response.model_dump(), indent=2))
        return

    # Human-readable output
    print(f"\n📊 Found {response.total_results} relevant genes")
    print(f"⏱️  Query time: {response.search_metadata.retrieval_time_ms:.1f}ms\n")

    if not response.genes:
        print("❌ No matching genes found.")
        return

    for i, gene in enumerate(response.genes, 1):
        print(f"\n{'=' * 70}")
        print(f"{i}. {gene.gene_symbol} - {gene.gene_name}")
        print(f"{'=' * 70}")
        print(f"Description: {gene.description}")
        print(f"Relevance Score: {gene.aggregate_score:.3f}")

        if gene.mgi_ids:
            print(f"MGI ID: {', '.join(gene.mgi_ids[:2])}")

        if gene.alleles:
            print(f"Alleles: {', '.join(gene.alleles[:3])}")
            if len(gene.alleles) > 3:
                print(f"         (+{len(gene.alleles) - 3} more)")

        print(f"\n📋 Top Phenotypes:")
        for j, pheno in enumerate(gene.phenotypes[:3], 1):
            print(f"  {j}. {pheno.phenotype_name}")
            print(f"     ID: {pheno.phenotype_id}")
            print(f"     Description: {pheno.phenotype_description[:100]}...")
            print(f"     Relevance: {pheno.relevance_score:.3f}")

        if len(gene.phenotypes) > 3:
            print(f"  ... and {len(gene.phenotypes) - 3} more phenotypes")

        if gene.pubmed_refs:
            count = len(gene.pubmed_refs)
            print(f"\n📚 References: {count} PubMed publications")

        if gene.genetic_backgrounds:
            print(f"🔬 Tested in: {', '.join(gene.genetic_backgrounds[:2])}")
            if len(gene.genetic_backgrounds) > 2:
                print(
                    f"             (+{len(gene.genetic_backgrounds) - 2} more backgrounds)"
                )


def main():
    """Main CLI loop"""

    # Check if database exists
    if not CHROMA_DB_PATH.exists():
        print("\n❌ Error: Vector database not found!")
        print(f"   Expected at: {CHROMA_DB_PATH}")
        print("\n   Please run: python scripts/build_vector_db.py")
        return 1

    print_header()

    # Initialize RAG engine
    try:
        print("⏳ Loading RAG engine...")
        engine = GeneRAGEngine()
        print("✅ Ready!\n")
    except Exception as e:
        print(f"❌ Error initializing RAG engine: {e}")
        return 1

    # Settings
    show_json = False
    top_k = 5

    # Main loop
    while True:
        try:
            # Get user input
            user_input = input("🔍 Query (or 'exit'): ").strip()

            if not user_input:
                continue

            # Handle commands
            if user_input.lower() in ["exit", "quit", "q"]:
                print("\n👋 Goodbye!")
                break

            if user_input.lower() == "json":
                show_json = not show_json
                status = "ON" if show_json else "OFF"
                print(f"✅ JSON output mode: {status}")
                continue

            if user_input.lower().startswith("top"):
                try:
                    new_k = int(user_input.split()[1])
                    if 1 <= new_k <= 20:
                        top_k = new_k
                        print(f"✅ Set top_k = {top_k}")
                    else:
                        print("❌ top_k must be between 1 and 20")
                except:
                    print("❌ Usage: top <number>")
                continue

            # Execute query
            print()
            response = engine.query(user_input, top_k=top_k)

            # Display results
            display_results(response, show_json)

            print("\n" + "-" * 70)

        except KeyboardInterrupt:
            print("\n\n👋 Interrupted. Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback

            traceback.print_exc()

    return 0


if __name__ == "__main__":
    sys.exit(main())

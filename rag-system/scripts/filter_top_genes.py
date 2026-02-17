"""
Filter data to top N genes by phenotype count
"""

import json
import sys
from pathlib import Path

def filter_top_genes(input_file: Path, output_file: Path, top_n: int = 1000):
    """Filter to top N genes by phenotype count"""
    
    print(f"\n📊 Filtering to top {top_n} genes...")
    
    # Load data
    with open(input_file, 'r', encoding='utf-8') as f:
        gene_data = json.load(f)
    
    print(f"   Loaded {len(gene_data):,} genes")
    
    # Sort by phenotype count
    sorted_genes = sorted(
        gene_data.items(),
        key=lambda x: len(x[1].get('phenotypes', [])),
        reverse=True
    )
    
    # Take top N
    top_genes = dict(sorted_genes[:top_n])
    
    total_phenotypes = sum(len(g.get('phenotypes', [])) for g in top_genes.values())
    
    print(f"   Selected top {len(top_genes):,} genes")
    print(f"   Total phenotypes: {total_phenotypes:,}")
    
    # Save filtered data
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(top_genes, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Saved to {output_file.name}")
    print(f"   File size: {output_file.stat().st_size / (1024*1024):.1f} MB")
    
    return top_genes, total_phenotypes


if __name__ == "__main__":
    top_n = int(sys.argv[1]) if len(sys.argv) > 1 else 1000
    
    input_file = Path("data/processed/gene_phenotype_data.json")
    output_file = Path(f"data/processed/gene_phenotype_data_top{top_n}.json")
    
    if not input_file.exists():
        print(f"❌ Error: {input_file} not found!")
        sys.exit(1)
    
    filter_top_genes(input_file, output_file, top_n)

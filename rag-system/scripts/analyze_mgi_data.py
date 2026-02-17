#!/usr/bin/env python3
"""
Quick script to analyze MGI data and check gene counts
"""

import re
from collections import defaultdict

def extract_gene_symbol(allele_string):
    """Extract gene symbol from allele notation"""
    if not allele_string:
        return ""
    match = re.match(r"^([A-Za-z0-9]+)", allele_string)
    if match:
        return match.group(1)
    return allele_string

# Parse the file
gene_data = defaultdict(set)
total_lines = 0
valid_lines = 0

print("📊 Analyzing MGI_PhenoGenoMP.rpt.txt...")
print()

with open("data/MGI_PhenoGenoMP.rpt.txt", "r", encoding="utf-8") as f:
    for line in f:
        total_lines += 1
        line = line.strip()
        if not line:
            continue
            
        parts = line.split("\t")
        if len(parts) < 6:
            continue
            
        valid_lines += 1
        allele = parts[1]
        phenotype_id = parts[3]
        mgi_gene_id = parts[5]
        
        # Extract gene symbol
        allele_parts = allele.split("|")
        gene_symbol = extract_gene_symbol(allele_parts[0])
        
        if gene_symbol:
            gene_data[gene_symbol].add(phenotype_id)

print(f"Total lines processed: {total_lines:,}")
print(f"Valid data lines: {valid_lines:,}")
print(f"Unique genes found: {len(gene_data):,}")
print()

# Calculate stats
total_phenotypes = sum(len(phenos) for phenos in gene_data.values())
print(f"Total gene-phenotype associations: {total_phenotypes:,}")
print(f"Average phenotypes per gene: {total_phenotypes / len(gene_data):.1f}")
print()

# Show top 20 genes by phenotype count
print("Top 20 genes by phenotype count:")
sorted_genes = sorted(gene_data.items(), key=lambda x: len(x[1]), reverse=True)
for i, (gene, phenos) in enumerate(sorted_genes[:20], 1):
    print(f"  {i:2d}. {gene:10s} - {len(phenos):,} phenotypes")

print()
print(f"✅ The file contains data for {len(gene_data):,} unique genes")
print(f"   This is the ACTUAL number that should be in your RAG system!")

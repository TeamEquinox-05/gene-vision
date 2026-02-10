"""
Data processing module for parsing MGI and phenotype vocabulary data
"""

import json
from pathlib import Path
from typing import Dict, List, Optional

try:
    from .config import MGI_PHENOGENOMP_FILE, PHENOTYPE_VOCAB_FILE, PROCESSED_DATA_FILE
    from .gene_curator import get_curated_gene_list, is_curated_gene, CURATED_GENES
    from .utils import extract_gene_symbol, clean_text
except ImportError:
    from config import MGI_PHENOGENOMP_FILE, PHENOTYPE_VOCAB_FILE, PROCESSED_DATA_FILE
    from gene_curator import get_curated_gene_list, is_curated_gene, CURATED_GENES
    from utils import extract_gene_symbol, clean_text


def parse_mgi_phenogenomp(filepath: Path) -> List[Dict]:
    """
    Parse MGI_PhenoGenoMP.rpt.txt file

    File format (tab-separated):
    Column 0: Genotype (e.g., 'Rb1<tm1Tyj>/Rb1<tm1Tyj>')
    Column 1: Allele (e.g., 'Rb1<tm1Tyj>')
    Column 2: Genetic Background
    Column 3: Phenotype ID (e.g., 'MP:0000600')
    Column 4: PubMed ID
    Column 5: MGI Gene ID (e.g., 'MGI:97874')

    Returns:
        List of dictionaries with parsed data
    """
    print(f"📖 Parsing MGI PhenoGenoMP data from {filepath.name}...")

    records = []
    line_count = 0

    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line_count += 1
            line = line.strip()
            if not line:
                continue

            parts = line.split("\t")
            if len(parts) < 6:
                continue

            genotype = parts[0]
            allele = parts[1]
            genetic_background = parts[2]
            phenotype_id = parts[3]
            pubmed_id = parts[4]
            mgi_gene_id = parts[5]

            # Extract gene symbol from allele
            # Handle cases with multiple alleles (e.g., 'Gene1|Gene2')
            allele_parts = allele.split("|")
            gene_symbol = extract_gene_symbol(allele_parts[0])

            records.append(
                {
                    "genotype": genotype,
                    "allele": allele,
                    "gene_symbol": gene_symbol,
                    "genetic_background": genetic_background,
                    "phenotype_id": phenotype_id,
                    "pubmed_id": pubmed_id,
                    "mgi_gene_id": mgi_gene_id,
                }
            )

    print(f"✅ Parsed {len(records):,} records from {line_count:,} lines")
    return records


def parse_phenotype_vocab(filepath: Path) -> Dict[str, Dict]:
    """
    Parse VOC_MammalianPhenotype.rpt.txt file

    File format (tab-separated):
    Column 0: Phenotype ID (e.g., 'MP:0000001')
    Column 1: Phenotype name (e.g., 'mammalian phenotype')
    Column 2: Phenotype description

    Returns:
        Dictionary mapping phenotype_id -> {name, description}
    """
    print(f"📖 Parsing phenotype vocabulary from {filepath.name}...")

    phenotypes = {}
    line_count = 0

    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line_count += 1
            line = line.strip()
            if not line:
                continue

            parts = line.split("\t")
            if len(parts) < 3:
                continue

            phenotype_id = parts[0]
            phenotype_name = parts[1]
            phenotype_description = parts[2]

            phenotypes[phenotype_id] = {
                "name": phenotype_name,
                "description": phenotype_description,
            }

    print(
        f"✅ Parsed {len(phenotypes):,} phenotype definitions from {line_count:,} lines"
    )
    return phenotypes


def create_enriched_dataset(
    mgi_records: List[Dict], phenotype_vocab: Dict[str, Dict]
) -> List[Dict]:
    """
    Combine MGI records with phenotype descriptions

    Args:
        mgi_records: Parsed MGI data
        phenotype_vocab: Phenotype ID to description mapping

    Returns:
        List of enriched records with phenotype information
    """
    print("🔗 Enriching MGI data with phenotype descriptions...")

    enriched = []
    missing_phenotypes = set()

    for record in mgi_records:
        phenotype_id = record["phenotype_id"]

        if phenotype_id in phenotype_vocab:
            pheno_info = phenotype_vocab[phenotype_id]
            enriched_record = {
                **record,
                "phenotype_name": pheno_info["name"],
                "phenotype_description": pheno_info["description"],
            }
            enriched.append(enriched_record)
        else:
            missing_phenotypes.add(phenotype_id)

    if missing_phenotypes:
        print(f"⚠️  {len(missing_phenotypes)} phenotype IDs not found in vocabulary")

    print(f"✅ Created {len(enriched):,} enriched records")
    return enriched


def filter_curated_genes(enriched_data: List[Dict]) -> List[Dict]:
    """
    Filter data to only include curated genes

    Args:
        enriched_data: Enriched MGI records

    Returns:
        Filtered records for curated genes only
    """
    curated_list = get_curated_gene_list()
    print(
        f"🎯 Filtering for {len(curated_list)} curated genes: {', '.join(curated_list)}"
    )

    filtered = []
    for record in enriched_data:
        if is_curated_gene(record["gene_symbol"]):
            filtered.append(record)

    print(f"✅ Filtered to {len(filtered):,} records for curated genes")
    return filtered


def aggregate_by_gene(filtered_data: List[Dict]) -> Dict[str, Dict]:
    """
    Aggregate records by gene symbol

    Returns:
        Dictionary mapping gene_symbol -> aggregated data
    """
    print("📊 Aggregating data by gene...")

    gene_data = {}

    for record in filtered_data:
        gene_sym = record["gene_symbol"]

        if gene_sym not in gene_data:
            gene_data[gene_sym] = {
                "gene_symbol": "",
                "gene_name": "",
                "description": "",
                "mgi_ids": set(),
                "alleles": set(),
                "phenotypes": [],
                "pubmed_refs": set(),
                "genetic_backgrounds": set(),
            }

        gene_info = gene_data[gene_sym]

        # Set basic info
        if not gene_info["gene_symbol"]:
            gene_info["gene_symbol"] = gene_sym
            if gene_sym in CURATED_GENES:
                gene_info["gene_name"] = CURATED_GENES[gene_sym]["name"]
                gene_info["description"] = CURATED_GENES[gene_sym]["description"]

        # Collect unique values
        gene_info["mgi_ids"].add(record["mgi_gene_id"])
        gene_info["alleles"].add(record["allele"])
        gene_info["pubmed_refs"].add(record["pubmed_id"])
        gene_info["genetic_backgrounds"].add(record["genetic_background"])

        # Add phenotype
        gene_info["phenotypes"].append(
            {
                "phenotype_id": record["phenotype_id"],
                "phenotype_name": record["phenotype_name"],
                "phenotype_description": record["phenotype_description"],
            }
        )

    # Convert sets to lists for JSON serialization
    for gene_sym in gene_data:
        gene_data[gene_sym]["mgi_ids"] = list(gene_data[gene_sym]["mgi_ids"])
        gene_data[gene_sym]["alleles"] = list(gene_data[gene_sym]["alleles"])
        gene_data[gene_sym]["pubmed_refs"] = list(gene_data[gene_sym]["pubmed_refs"])
        gene_data[gene_sym]["genetic_backgrounds"] = list(
            gene_data[gene_sym]["genetic_backgrounds"]
        )

    print(f"✅ Aggregated data for {len(gene_data)} genes")
    return dict(gene_data)


def save_processed_data(gene_data: Dict, output_path: Path):
    """Save processed data to JSON file"""
    print(f"💾 Saving processed data to {output_path.name}...")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(gene_data, f, indent=2, ensure_ascii=False)

    print(f"✅ Saved processed data ({output_path.stat().st_size / 1024:.1f} KB)")


def process_all_data():
    """
    Main function to process all data

    Returns:
        Tuple of (filtered_records, gene_aggregated_data)
    """
    print("\n🚀 Starting data processing pipeline...\n")

    # Step 1: Parse raw data
    mgi_records = parse_mgi_phenogenomp(MGI_PHENOGENOMP_FILE)
    phenotype_vocab = parse_phenotype_vocab(PHENOTYPE_VOCAB_FILE)

    print()

    # Step 2: Enrich with phenotype descriptions
    enriched_data = create_enriched_dataset(mgi_records, phenotype_vocab)

    print()

    # Step 3: Filter for curated genes
    filtered_data = filter_curated_genes(enriched_data)

    print()

    # Step 4: Aggregate by gene
    gene_data = aggregate_by_gene(filtered_data)

    print()

    # Step 5: Save processed data
    save_processed_data(gene_data, PROCESSED_DATA_FILE)

    print("\n✨ Data processing complete!\n")

    # Print summary
    print("📈 Summary:")
    for gene_sym, data in sorted(gene_data.items()):
        print(
            f"  • {gene_sym} ({data['gene_name']}): {len(data['phenotypes'])} phenotypes, "
            f"{len(data['alleles'])} alleles, {len(data['pubmed_refs'])} studies"
        )

    return filtered_data, gene_data


if __name__ == "__main__":
    process_all_data()

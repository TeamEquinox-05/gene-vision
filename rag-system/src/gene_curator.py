"""
Curated list of monogenic genes for MVP
Based on well-established gene-phenotype relationships from overview.md
"""

CURATED_GENES = {
    "Tyr": {
        "name": "Tyrosinase",
        "description": "Enzyme required for melanin production. Mutations cause albinism - complete absence of pigmentation in fur, skin and eyes",
        "traits": ["albinism", "coat color", "pigmentation", "white fur"],
        "phenotype_terms": [
            "albinism",
            "albino",
            "white",
            "pigmentation",
            "melanin",
            "coat color",
            "no pigmentation",
            "absent pigmentation",
        ],
        "reason": "Well-established monogenic trait for pigmentation",
    },
    "Lep": {
        "name": "Leptin",
        "description": "Hormone that regulates appetite and metabolism",
        "traits": ["obesity", "increased body weight", "fat accumulation"],
        "phenotype_terms": [
            "obesity",
            "obese",
            "fat",
            "body weight",
            "increased body weight",
            "adipose",
        ],
        "reason": "Classic monogenic obesity model",
    },
    "Lepr": {
        "name": "Leptin Receptor",
        "description": "Receptor for leptin hormone",
        "traits": ["obesity", "diabetes", "increased body weight"],
        "phenotype_terms": [
            "obesity",
            "diabetes",
            "body weight",
            "metabolic",
            "adipose",
        ],
        "reason": "Monogenic obesity with metabolic dysfunction",
    },
    "Cpe": {
        "name": "Carboxypeptidase E",
        "description": "Enzyme involved in neuropeptide processing",
        "traits": ["late-onset obesity", "increased body weight"],
        "phenotype_terms": ["obesity", "body weight", "fat"],
        "reason": "Late-onset obesity model",
    },
    "Kit": {
        "name": "KIT Proto-Oncogene",
        "description": "Receptor tyrosine kinase involved in melanocyte development. Causes white spotting pattern on fur.",
        "traits": ["white spotting", "piebald", "coat color", "pigmentation"],
        "phenotype_terms": [
            "white spotting",
            "piebald",
            "coat color",
            "pigmentation",
            "white patches",
            "white fur",
            "white coat",
            "spotted",
            "patched fur",
        ],
        "reason": "Dominant white spotting phenotype",
    },
    "Pax6": {
        "name": "Paired Box 6",
        "description": "Transcription factor critical for eye development",
        "traits": ["anophthalmia", "no eyes", "absent eyes", "eye defects"],
        "phenotype_terms": [
            "anophthalmia",
            "eye",
            "absent eyes",
            "no eyes",
            "eye development",
        ],
        "reason": "Clear monogenic eye defect",
    },
    "Hoxd13": {
        "name": "Homeobox D13",
        "description": "Transcription factor involved in limb development",
        "traits": ["polydactyly", "extra toes", "extra digits"],
        "phenotype_terms": [
            "polydactyly",
            "extra toes",
            "extra digits",
            "digit number",
        ],
        "reason": "Synpolydactyly phenotype",
    },
    "Mstn": {
        "name": "Myostatin",
        "description": "Negative regulator of muscle growth",
        "traits": ["increased muscle mass", "hypermuscular", "strong"],
        "phenotype_terms": [
            "muscle mass",
            "muscle hypertrophy",
            "increased muscle",
            "muscular",
            "strong",
        ],
        "reason": "Dramatic muscle mass increase",
    },
    "Trp53": {
        "name": "Transformation Related Protein 53",
        "description": "Tumor suppressor gene",
        "traits": ["cancer susceptibility", "tumor development"],
        "phenotype_terms": ["tumor", "cancer", "neoplasm", "tumor suppressor"],
        "reason": "Well-known tumor suppressor",
    },
    "Mc1r": {
        "name": "Melanocortin 1 Receptor",
        "description": "Receptor that regulates melanin production. Controls coat color - mutations produce red, yellow, brown, or diluted pigmentation.",
        "traits": ["coat color", "red/yellow pigmentation"],
        "phenotype_terms": [
            "coat color",
            "pigmentation",
            "melanin",
            "yellow fur",
            "red fur",
            "pink fur",
            "brown fur",
            "diluted coat color",
            "light colored fur",
            "pale fur",
            "red pigment",
            "yellow pigment",
            "pheomelanin",
        ],
        "reason": "Controls eumelanin vs pheomelanin production",
    },
}


def get_curated_gene_list():
    """Return list of curated gene symbols"""
    return list(CURATED_GENES.keys())


def get_gene_info(gene_symbol):
    """Get information about a specific gene"""
    return CURATED_GENES.get(gene_symbol)


def is_curated_gene(gene_symbol):
    """Check if a gene symbol is in the curated list"""
    return gene_symbol in CURATED_GENES


def get_all_phenotype_terms():
    """Get all phenotype search terms across all genes"""
    terms = set()
    for gene_data in CURATED_GENES.values():
        terms.update(gene_data["phenotype_terms"])
    return list(terms)

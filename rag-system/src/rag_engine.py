"""
RAG Engine for gene-phenotype queries with biological validation
"""

import time
import json
from typing import List, Dict, Optional
from collections import defaultdict

try:
    from .config import CHROMA_DB_PATH, EMBEDDING_MODEL, DEFAULT_TOP_K
    from .vector_store import VectorStore
    from .schemas import (
        QueryResponse,
        GeneResult,
        PhenotypeResult,
        SearchMetadata,
        BiologicalWarning,
    )
    from .gene_curator import CURATED_GENES
    from .utils import deduplicate_list
except ImportError:
    from config import CHROMA_DB_PATH, EMBEDDING_MODEL, DEFAULT_TOP_K
    from vector_store import VectorStore
    from schemas import (
        QueryResponse,
        GeneResult,
        PhenotypeResult,
        SearchMetadata,
        BiologicalWarning,
    )
    from gene_curator import CURATED_GENES
    from utils import deduplicate_list


class BiologicalValidator:
    """
    Validates biological plausibility of user queries and provides educational feedback.

    Uses keyword matching to detect impossible traits (e.g., pink fur, blue fur)
    and provides helpful explanations with scientifically accurate alternatives.
    """

    # Colors that cannot be produced by mouse genetics
    IMPOSSIBLE_COLORS = {
        "pink": {
            "explanation": "Pink fur cannot be produced in mice. Mice only produce two pigment types: eumelanin (black/brown) and pheomelanin (yellow/red). 'Pink' in mice refers to the pink eyes and skin visible in albino or hairless mice, not fur color.",
            "closest_genes": ["Tyr", "Hr"],
            "alternatives": [
                "albino mouse (white fur, pink eyes)",
                "hairless mouse (visible pink skin)",
                "diluted coat color",
            ],
        },
        "blue": {
            "explanation": "Blue fur is biologically impossible in mice. Mammalian melanocytes produce only eumelanin (black/brown) and pheomelanin (yellow/red) pigments. However, the 'dilute' mutation can create a blue-gray appearance.",
            "closest_genes": ["Tyr", "Mc1r"],
            "alternatives": [
                "diluted coat color (appears blue-gray)",
                "gray mouse",
                "light colored fur",
            ],
        },
        "green": {
            "explanation": "Green fur does not exist in mice. Mice cannot produce chlorophyll or other green pigments naturally.",
            "closest_genes": [],
            "alternatives": ["yellow coat color", "agouti (yellow-brown banding)"],
        },
        "purple": {
            "explanation": "Purple fur is impossible. Mice produce only black/brown (eumelanin) and yellow/red (pheomelanin) pigments.",
            "closest_genes": ["Mc1r"],
            "alternatives": ["diluted coat color", "dark coat color"],
        },
        "rainbow": {
            "explanation": "Multi-color 'rainbow' patterns do not occur naturally in mice. Coat color is determined by melanin pigments, not structural coloration.",
            "closest_genes": ["Kit"],
            "alternatives": [
                "white spotting (piebald)",
                "mottled coat",
                "variegated coat color",
            ],
        },
        "neon": {
            "explanation": "Fluorescent or neon colors cannot be produced by natural mouse genetics.",
            "closest_genes": [],
            "alternatives": ["yellow coat color", "white coat color"],
        },
    }

    # Confidence thresholds for RAG results
    HIGH_CONFIDENCE = 0.04
    MEDIUM_CONFIDENCE = 0.02
    LOW_CONFIDENCE = 0.01

    # Impossible anatomical features for mammals
    IMPOSSIBLE_ANATOMY = {
        "wings": {
            "explanation": "Wings are not possible in mice. Mammals do not have the anatomical structures required for flight (no specialized forelimbs with flight feathers or membranes in mice).",
            "closest_genes": [],
            "alternatives": ["elongated limbs", "skeletal modifications"],
        },
        "gills": {
            "explanation": "Gills are impossible in mice. Mice are terrestrial mammals that breathe air through lungs, not aquatic organisms. They lack the gill structures found in fish.",
            "closest_genes": [],
            "alternatives": ["respiratory system changes", "lung modifications"],
        },
        "feathers": {
            "explanation": "Feathers are avian-specific structures. Mammals, including mice, have hair/fur, not feathers. This is a fundamental difference between birds and mammals.",
            "closest_genes": [],
            "alternatives": ["fur texture changes", "hairless mouse"],
        },
        "scales": {
            "explanation": "Scales (like reptilian or fish scales) are not found in mice. While mice do have tail scales, these are epidermal structures very different from reptilian/fish scales.",
            "closest_genes": [],
            "alternatives": ["skin texture changes", "tail morphology"],
        },
        "antenna": {
            "explanation": "Antennae are arthropod sensory structures. Mice have whiskers (vibrissae) for sensing, not antennae.",
            "closest_genes": [],
            "alternatives": ["whisker length", "sensory hair modifications"],
        },
        "tentacles": {
            "explanation": "Tentacles are found in cephalopods and other invertebrates, not mammals. Mice have standard mammalian limb structure.",
            "closest_genes": [],
            "alternatives": ["limb elongation", "digit modifications"],
        },
    }

    # Limb count constraints
    LIMB_COUNT_ISSUES = {
        "two legs": {
            "explanation": "Mice are quadrupeds with four legs. While mutations can cause limb loss, a natural 'two-legged' mouse standing upright is not achievable through single gene modification.",
            "closest_genes": [],
            "alternatives": ["limb reduction", "shortened limbs", "polydactyly"],
        },
        "2 legs": {
            "explanation": "Mice are quadrupeds with four legs. While mutations can cause limb loss, a natural 'two-legged' mouse standing upright is not achievable through single gene modification.",
            "closest_genes": [],
            "alternatives": ["limb reduction", "shortened limbs", "polydactyly"],
        },
        "six legs": {
            "explanation": "Six legs (hexapod body plan) is an insect characteristic. Mammals have four limbs as a conserved tetrapod feature. No genetic modification can add extra limb pairs.",
            "closest_genes": [],
            "alternatives": ["polydactyly (extra digits)", "limb duplication"],
        },
        "6 legs": {
            "explanation": "Six legs (hexapod body plan) is an insect characteristic. Mammals have four limbs as a conserved tetrapod feature. No genetic modification can add extra limb pairs.",
            "closest_genes": [],
            "alternatives": ["polydactyly (extra digits)", "limb duplication"],
        },
        "eight legs": {
            "explanation": "Eight legs is an arachnid body plan. Mammals have the tetrapod four-limb body plan, which cannot be changed to eight limbs through gene modification.",
            "closest_genes": [],
            "alternatives": ["polydactyly (extra digits)", "limb morphology"],
        },
        "no legs": {
            "explanation": "While severe limb reduction is theoretically possible, complete absence of all four limbs in a viable mouse is extremely rare and not controlled by monogenic traits.",
            "closest_genes": [],
            "alternatives": [
                "shortened limbs",
                "limb reduction",
                "digit abnormalities",
            ],
        },
    }

    # Additional impossible traits
    IMPOSSIBLE_TRAITS = {
        "transparent": {
            "explanation": "Transparent or see-through tissue is not possible in mice naturally. Mice have opaque tissues and organs.",
            "closest_genes": [],
            "alternatives": ["hairless mouse (visible skin)", "albino mouse"],
        },
        "glowing": {
            "explanation": "Natural bioluminescence does not exist in mice. While GFP transgenic mice exist in research, this is not a natural genetic modification.",
            "closest_genes": [],
            "alternatives": ["white fur (appears to glow in certain light)", "albino"],
        },
        "metallic": {
            "explanation": "Metallic or reflective fur is not possible. Mammalian hair does not produce structural coloration like some bird feathers or insect exoskeletons.",
            "closest_genes": [],
            "alternatives": ["glossy fur", "diluted coat color"],
        },
        "glitter": {
            "explanation": "Glittery or sparkly appearance is not possible in natural mouse fur. This would require structural coloration not found in mammals.",
            "closest_genes": [],
            "alternatives": ["light colored fur", "white fur"],
        },
    }

    def validate_query(
        self, user_prompt: str, top_gene_score: Optional[float] = None
    ) -> Optional[BiologicalWarning]:
        """
        Validate biological plausibility of a query.

        Args:
            user_prompt: User's natural language query
            top_gene_score: Aggregate score of top-ranked gene (if available)

        Returns:
            BiologicalWarning if validation fails or low confidence, None otherwise
        """
        prompt_lower = user_prompt.lower()

        # Check for impossible color keywords
        for color, details in self.IMPOSSIBLE_COLORS.items():
            if color in prompt_lower:
                # Check if "fur" or "coat" is mentioned with the color
                is_fur_query = any(
                    word in prompt_lower
                    for word in ["fur", "coat", "mouse", "color", "colored"]
                )

                if (
                    is_fur_query or len(prompt_lower.split()) <= 3
                ):  # Short queries like "pink mouse"
                    return BiologicalWarning(
                        type="impossible_trait",
                        message=details["explanation"],
                        suggestions=details["alternatives"],
                        confidence_level="low",
                    )

        # Check for impossible anatomical features
        for feature, details in self.IMPOSSIBLE_ANATOMY.items():
            if feature in prompt_lower:
                return BiologicalWarning(
                    type="impossible_trait",
                    message=details["explanation"],
                    suggestions=details["alternatives"],
                    confidence_level="low",
                )

        # Check for limb count issues
        for phrase, details in self.LIMB_COUNT_ISSUES.items():
            if phrase in prompt_lower:
                return BiologicalWarning(
                    type="impossible_trait",
                    message=details["explanation"],
                    suggestions=details["alternatives"],
                    confidence_level="low",
                )

        # Check for other impossible traits
        for trait, details in self.IMPOSSIBLE_TRAITS.items():
            if trait in prompt_lower:
                return BiologicalWarning(
                    type="impossible_trait",
                    message=details["explanation"],
                    suggestions=details["alternatives"],
                    confidence_level="low",
                )

        # Check confidence level based on RAG score
        if top_gene_score is not None:
            if top_gene_score < self.LOW_CONFIDENCE:
                return BiologicalWarning(
                    type="low_confidence",
                    message=f"Very low confidence match (score: {top_gene_score:.3f}). The query may describe a trait not in the database, or it may not be achievable through monogenic modification. Results shown are the closest available matches.",
                    suggestions=[
                        "Try rephrasing with more specific phenotype terms",
                        "Use scientific terminology",
                        "Check if trait is biologically feasible in mice",
                    ],
                    confidence_level="low",
                )
            elif top_gene_score < self.MEDIUM_CONFIDENCE:
                return BiologicalWarning(
                    type="low_confidence",
                    message=f"Low confidence match (score: {top_gene_score:.3f}). The trait may be complex or involve multiple genes. Results shown are the closest single-gene matches.",
                    suggestions=[
                        "Try rephrasing with more specific terms",
                        "Use scientific phenotype terms",
                    ],
                    confidence_level="low",
                )

        return None


class GeneRAGEngine:
    """Main RAG engine for querying gene-phenotype database with biological validation"""

    def __init__(self, chroma_db_path=CHROMA_DB_PATH, embedding_model=EMBEDDING_MODEL):
        """
        Initialize RAG engine

        Args:
            chroma_db_path: Path to ChromaDB database
            embedding_model: Name of embedding model
        """
        print(f"🧬 Initializing GeneVision RAG Engine...")
        self.vector_store = VectorStore(chroma_db_path, embedding_model)
        self.embedding_model_name = embedding_model
        self.validator = BiologicalValidator()
        print(f"✅ RAG Engine ready!")

    def query(self, user_prompt: str, top_k: int = DEFAULT_TOP_K) -> QueryResponse:
        """
        Query the RAG system for genes with biological validation

        Args:
            user_prompt: Natural language query (e.g., "create a fat mouse")
            top_k: Maximum number of genes to return

        Returns:
            QueryResponse with ranked genes, metadata, and optional biological warning
        """
        start_time = time.time()

        print(f"\n🔍 Query: '{user_prompt}'")

        # Step 1: Validate query for impossible traits (keyword check)
        initial_warning = self.validator.validate_query(user_prompt)

        # Step 2: Search vector database (even if warning exists - permissive approach)
        search_k = top_k * 3  # Get 3x candidates for aggregation
        results, similarities = self.vector_store.query(user_prompt, top_k=search_k)

        print(f"  📊 Retrieved {len(results)} candidate gene-phenotype pairs")

        # Step 3: Aggregate results by gene
        aggregated_genes = self.aggregate_by_gene(results, similarities)

        print(f"  🧬 Aggregated into {len(aggregated_genes)} unique genes")

        # Step 4: Rank genes
        ranked_genes = self.rank_genes(aggregated_genes)

        # Step 5: Filter by minimum score threshold (ALL genes, not just curated)
        MINIMUM_SCORE_THRESHOLD = 0.01  # Filter out very weak matches
        filtered_genes = [
            g for g in ranked_genes if g["aggregate_score"] >= MINIMUM_SCORE_THRESHOLD
        ]
        top_genes = filtered_genes[:top_k]

        curated_count = sum(1 for g in top_genes if g.get("is_curated", False))
        print(
            f"  🎯 Filtered to {len(filtered_genes)} genes (min score: {MINIMUM_SCORE_THRESHOLD})"
        )
        print(
            f"  📊 Returning top {len(top_genes)} genes ({curated_count} curated ⭐, {len(top_genes) - curated_count} from database)"
        )

        # Step 6: Format response
        gene_results = self.format_gene_results(top_genes)

        # Step 7: Determine final warning (combine keyword + confidence check)
        final_warning = initial_warning
        if gene_results and not final_warning:
            # Check confidence if no keyword warning
            top_score = gene_results[0].aggregate_score
            final_warning = self.validator.validate_query(user_prompt, top_score)

        # Calculate elapsed time
        elapsed_ms = (time.time() - start_time) * 1000

        response = QueryResponse(
            query=user_prompt,
            genes=gene_results,
            total_results=len(gene_results),
            search_metadata=SearchMetadata(
                retrieval_time_ms=round(elapsed_ms, 2),
                embedding_model=self.embedding_model_name,
                top_k=top_k,
                total_candidates=len(results),
            ),
            warning=final_warning,
        )

        return response

    def aggregate_by_gene(
        self, results: List[Dict], similarities: List[float]
    ) -> Dict[str, Dict]:
        """
        Aggregate search results by gene symbol

        Args:
            results: List of search result metadata
            similarities: Corresponding similarity scores

        Returns:
            Dictionary mapping gene_symbol -> aggregated data
        """
        gene_data = defaultdict(
            lambda: {
                "gene_symbol": "",
                "gene_name": "",
                "description": "",
                "is_curated": False,
                "mgi_ids": [],
                "alleles": [],
                "phenotypes": [],
                "pubmed_refs": [],
                "genetic_backgrounds": [],
                "similarity_scores": [],
            }
        )

        for result, similarity in zip(results, similarities):
            gene_sym = result.get("gene_symbol", "")

            if not gene_sym:
                continue

            gene_info = gene_data[gene_sym]

            # Set basic info (first occurrence)
            if not gene_info["gene_symbol"]:
                gene_info["gene_symbol"] = gene_sym
                gene_info["gene_name"] = result.get("gene_name", "")
                gene_info["description"] = result.get("description", "")
                gene_info["is_curated"] = result.get("is_curated", False)

            # Add phenotype with score
            phenotype = {
                "phenotype_id": result.get("phenotype_id", ""),
                "phenotype_name": result.get("phenotype_name", ""),
                "phenotype_description": result.get("phenotype_description", ""),
                "relevance_score": round(similarity, 4),
            }
            gene_info["phenotypes"].append(phenotype)
            gene_info["similarity_scores"].append(similarity)

            # Collect metadata (deserialize JSON strings)
            if result.get("mgi_id"):
                gene_info["mgi_ids"].append(result["mgi_id"])

            try:
                alleles = json.loads(result.get("alleles_json", "[]"))
                gene_info["alleles"].extend(alleles)
            except:
                pass

            try:
                pubmed_refs = json.loads(result.get("pubmed_refs_json", "[]"))
                gene_info["pubmed_refs"].extend(pubmed_refs)
            except:
                pass

            try:
                backgrounds = json.loads(result.get("genetic_backgrounds_json", "[]"))
                gene_info["genetic_backgrounds"].extend(backgrounds)
            except:
                pass

        # Deduplicate lists
        for gene_sym in gene_data:
            gene_info = gene_data[gene_sym]
            gene_info["mgi_ids"] = deduplicate_list(gene_info["mgi_ids"])
            gene_info["alleles"] = deduplicate_list(gene_info["alleles"])
            gene_info["pubmed_refs"] = deduplicate_list(gene_info["pubmed_refs"])
            gene_info["genetic_backgrounds"] = deduplicate_list(
                gene_info["genetic_backgrounds"]
            )

        return dict(gene_data)

    def rank_genes(self, aggregated_genes: Dict[str, Dict]) -> List[Dict]:
        """
        Rank genes by relevance

        Ranking criteria:
        1. Average similarity score (primary)
        2. Number of matching phenotypes (secondary)

        Args:
            aggregated_genes: Aggregated gene data

        Returns:
            Sorted list of gene data dictionaries
        """
        ranked = []

        for gene_sym, gene_info in aggregated_genes.items():
            scores = gene_info.get("similarity_scores", [])

            if not scores:
                continue

            # Calculate aggregate score
            avg_score = sum(scores) / len(scores)
            max_score = max(scores)
            phenotype_count = len(gene_info.get("phenotypes", []))

            # Combined score: weighted average of avg and max score, boosted by phenotype count
            aggregate_score = (0.7 * avg_score + 0.3 * max_score) * (
                1 + 0.1 * min(phenotype_count, 5)
            )
            aggregate_score = min(aggregate_score, 1.0)  # Cap at 1.0

            gene_info["aggregate_score"] = round(aggregate_score, 4)
            ranked.append(gene_info)

        # Sort by aggregate score (descending)
        ranked.sort(key=lambda x: x["aggregate_score"], reverse=True)

        return ranked

    def calculate_confidence_level(self, aggregate_score: float) -> str:
        """
        Convert aggregate score to human-readable confidence level

        Args:
            aggregate_score: Numerical score (0-1)

        Returns:
            Confidence level: 'high', 'medium', or 'low'
        """
        if aggregate_score >= 0.04:
            return "high"
        elif aggregate_score >= 0.02:
            return "medium"
        else:
            return "low"

    def format_gene_results(self, ranked_genes: List[Dict]) -> List[GeneResult]:
        """
        Format ranked genes into GeneResult objects

        Args:
            ranked_genes: Ranked gene data

        Returns:
            List of GeneResult objects
        """
        gene_results = []

        for gene_info in ranked_genes:
            # Sort phenotypes by relevance score
            phenotypes = sorted(
                gene_info.get("phenotypes", []),
                key=lambda x: x.get("relevance_score", 0),
                reverse=True,
            )

            # Convert to PhenotypeResult objects
            phenotype_results = [PhenotypeResult(**pheno) for pheno in phenotypes]

            aggregate_score = gene_info.get("aggregate_score", 0.0)
            confidence_level = self.calculate_confidence_level(aggregate_score)

            gene_result = GeneResult(
                gene_symbol=gene_info.get("gene_symbol", ""),
                gene_name=gene_info.get("gene_name", ""),
                description=gene_info.get("description", ""),
                is_curated=gene_info.get("is_curated", False),
                mgi_ids=gene_info.get("mgi_ids", []),
                alleles=gene_info.get("alleles", []),
                phenotypes=phenotype_results,
                pubmed_refs=gene_info.get("pubmed_refs", []),
                genetic_backgrounds=gene_info.get("genetic_backgrounds", []),
                aggregate_score=aggregate_score,
                confidence_level=confidence_level,
            )

            gene_results.append(gene_result)

        return gene_results

    def query_json(self, user_prompt: str, top_k: int = DEFAULT_TOP_K) -> str:
        """
        Query and return JSON string

        Args:
            user_prompt: Natural language query
            top_k: Maximum number of genes to return

        Returns:
            JSON string of QueryResponse
        """
        response = self.query(user_prompt, top_k)
        return response.model_dump_json(indent=2)


if __name__ == "__main__":
    # Test the RAG engine
    engine = GeneRAGEngine()

    test_queries = [
        "create a fat mouse",
        "albino mouse",
        "mouse without eyes",
        "white coat color",
        "strong muscular mouse",
    ]

    for query in test_queries:
        print("\n" + "=" * 60)
        response = engine.query(query, top_k=3)
        print(f"\n📋 Results for: '{query}'")
        for i, gene in enumerate(response.genes, 1):
            print(f"\n{i}. {gene.gene_symbol} ({gene.gene_name})")
            print(f"   Score: {gene.aggregate_score:.3f}")
            print(f"   Top phenotypes:")
            for pheno in gene.phenotypes[:2]:
                print(
                    f"     • {pheno.phenotype_name} (score: {pheno.relevance_score:.3f})"
                )

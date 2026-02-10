"""
Pydantic models for structured JSON responses
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class PhenotypeResult(BaseModel):
    """Single phenotype result"""

    phenotype_id: str = Field(..., description="MGI Phenotype ID (e.g., MP:0000001)")
    phenotype_name: str = Field(..., description="Human-readable phenotype name")
    phenotype_description: str = Field(
        ..., description="Detailed phenotype description"
    )
    relevance_score: float = Field(
        ..., ge=0.0, le=1.0, description="Semantic similarity score (0-1)"
    )


class GeneResult(BaseModel):
    """Single gene result with associated phenotypes"""

    gene_symbol: str = Field(..., description="Gene symbol (e.g., Lep)")
    gene_name: str = Field(..., description="Full gene name (e.g., Leptin)")
    description: str = Field(..., description="Gene description/function")
    mgi_ids: List[str] = Field(default_factory=list, description="MGI Gene IDs")
    alleles: List[str] = Field(default_factory=list, description="Known alleles")
    phenotypes: List[PhenotypeResult] = Field(..., description="Associated phenotypes")
    pubmed_refs: List[str] = Field(
        default_factory=list, description="PubMed reference IDs"
    )
    genetic_backgrounds: List[str] = Field(
        default_factory=list, description="Tested genetic backgrounds"
    )
    aggregate_score: float = Field(
        ..., ge=0.0, le=1.0, description="Overall gene relevance score"
    )
    confidence_level: str = Field(
        ..., description="Confidence level: 'high', 'medium', or 'low'"
    )


class SearchMetadata(BaseModel):
    """Metadata about the search operation"""

    retrieval_time_ms: float = Field(
        ..., description="Query execution time in milliseconds"
    )
    embedding_model: str = Field(..., description="Embedding model used")
    top_k: int = Field(..., description="Number of results requested")
    total_candidates: int = Field(
        ..., description="Total gene-phenotype pairs searched"
    )


class BiologicalWarning(BaseModel):
    """Warning about biological plausibility"""

    type: str = Field(
        ...,
        description="Warning type: 'impossible_trait', 'low_confidence', 'ambiguous'",
    )
    message: str = Field(..., description="Human-readable explanation")
    suggestions: List[str] = Field(
        default_factory=list, description="Alternative search suggestions"
    )
    confidence_level: Optional[str] = Field(
        None, description="Confidence level: 'high', 'medium', 'low'"
    )


class QueryResponse(BaseModel):
    """Complete query response"""

    query: str = Field(..., description="Original user query")
    genes: List[GeneResult] = Field(..., description="Ranked list of matching genes")
    total_results: int = Field(..., description="Number of genes returned")
    search_metadata: SearchMetadata = Field(..., description="Search metadata")
    warning: Optional[BiologicalWarning] = Field(
        None, description="Biological plausibility warning (if applicable)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "query": "create a fat mouse",
                "genes": [
                    {
                        "gene_symbol": "Lep",
                        "gene_name": "Leptin",
                        "description": "Hormone that regulates appetite and metabolism",
                        "mgi_ids": ["MGI:104663"],
                        "alleles": ["Lep<ob>", "Lep<tm1>"],
                        "phenotypes": [
                            {
                                "phenotype_id": "MP:0001234",
                                "phenotype_name": "increased body weight",
                                "phenotype_description": "greater than normal average body weight",
                                "relevance_score": 0.95,
                            }
                        ],
                        "pubmed_refs": ["12345678"],
                        "genetic_backgrounds": ["C57BL/6J"],
                        "aggregate_score": 0.92,
                    }
                ],
                "total_results": 3,
                "search_metadata": {
                    "retrieval_time_ms": 145.2,
                    "embedding_model": "all-MiniLM-L6-v2",
                    "top_k": 5,
                    "total_candidates": 1250,
                },
            }
        }


class QueryRequest(BaseModel):
    """API request model"""

    prompt: str = Field(
        ..., min_length=1, description="Natural language query about gene modifications"
    )
    top_k: int = Field(
        default=5, ge=1, le=20, description="Maximum number of genes to return"
    )

    class Config:
        json_schema_extra = {"example": {"prompt": "create a fat mouse", "top_k": 5}}


class HealthResponse(BaseModel):
    """Health check response"""

    status: str
    version: str
    genes_indexed: int
    phenotypes_indexed: int


class GeneListResponse(BaseModel):
    """Response for listing available genes"""

    genes: List[dict]
    total: int

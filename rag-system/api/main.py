"""
FastAPI application for GeneVision RAG System
"""

import sys
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from rag_engine import GeneRAGEngine
from schemas import QueryRequest, QueryResponse, HealthResponse, GeneListResponse
from gene_curator import CURATED_GENES
from config import CHROMA_DB_PATH, PROCESSED_DATA_FILE
import json

# Global RAG engine instance
rag_engine = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for FastAPI app"""
    global rag_engine

    print("\n🚀 Starting GeneVision RAG API...")

    # Check if vector database exists
    if not CHROMA_DB_PATH.exists():
        print(f"❌ Error: Vector database not found at {CHROMA_DB_PATH}")
        print("   Please run: python scripts/build_vector_db.py")
        raise RuntimeError("Vector database not built. Run build_vector_db.py first.")

    # Initialize RAG engine
    print("⏳ Loading RAG engine...")
    rag_engine = GeneRAGEngine()
    print("✅ RAG engine loaded!")

    yield

    print("\n👋 Shutting down GeneVision RAG API...")


# Create FastAPI app
app = FastAPI(
    title="GeneVision RAG API",
    description="Retrieval-Augmented Generation API for genetic modification queries",
    version="1.0.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Info"])
async def root():
    """Root endpoint"""
    return {
        "name": "GeneVision RAG API",
        "version": "1.0.0",
        "description": "Query genetic modification database using natural language",
        "endpoints": {
            "POST /query": "Query for genes",
            "GET /health": "Health check",
            "GET /genes": "List curated genes",
            "GET /docs": "API documentation",
        },
    }


@app.get("/health", response_model=HealthResponse, tags=["Info"])
async def health_check():
    """Health check endpoint"""
    if rag_engine is None:
        raise HTTPException(status_code=503, detail="RAG engine not initialized")

    try:
        # Get collection info
        collection = rag_engine.vector_store.client.get_collection(
            name="gene_phenotypes"
        )
        doc_count = collection.count()

        # Load actual gene count from processed data
        with open(PROCESSED_DATA_FILE, "r") as f:
            gene_data = json.load(f)
            genes_count = len(gene_data)

        return HealthResponse(
            status="healthy",
            version="1.0.0",
            genes_indexed=genes_count,
            phenotypes_indexed=doc_count,
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")


@app.get("/genes", response_model=GeneListResponse, tags=["Genes"])
async def list_genes():
    """List all curated genes"""
    genes_list = [
        {
            "gene_symbol": symbol,
            "gene_name": info["name"],
            "description": info["description"],
            "traits": info["traits"],
        }
        for symbol, info in CURATED_GENES.items()
    ]

    return GeneListResponse(genes=genes_list, total=len(genes_list))


@app.post("/query", response_model=QueryResponse, tags=["Query"])
async def query_genes(request: QueryRequest):
    """
    Query the RAG system for genes based on natural language prompt

    Example request:
    ```json
    {
        "prompt": "create a fat mouse",
        "top_k": 5
    }
    ```

    Returns structured JSON with:
    - Ranked list of matching genes
    - Gene symbols, names, descriptions
    - Associated phenotypes with relevance scores
    - MGI IDs, alleles, PubMed references
    - Search metadata
    """
    if rag_engine is None:
        raise HTTPException(status_code=503, detail="RAG engine not initialized")

    try:
        response = rag_engine.query(request.prompt, top_k=request.top_k)
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    return JSONResponse(
        status_code=500, content={"detail": f"Internal server error: {str(exc)}"}
    )


if __name__ == "__main__":
    import uvicorn

    print("\n🧬 Starting GeneVision RAG API Server...")
    print("📚 API docs available at: http://localhost:8000/docs")
    print("\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)

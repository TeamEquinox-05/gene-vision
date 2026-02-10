# GeneVision RAG System

A Retrieval-Augmented Generation (RAG) system for querying gene-phenotype relationships using natural language. Built for the GeneVision project to enable AI-powered genetic modification queries.

## 🧬 Overview

This system allows users to query genetic modifications using natural language prompts (e.g., "create a fat mouse") and returns structured JSON with relevant genes, phenotypes, and scientific metadata.

### Key Features

- **Natural Language Queries**: Ask questions in plain English
- **Semantic Search**: Uses embeddings to understand meaning beyond keywords
- **Structured JSON Output**: Returns complete gene metadata (alleles, phenotypes, references)
- **Curated Gene Database**: Focuses on well-established monogenic traits
- **REST API**: FastAPI endpoint for frontend integration
- **Interactive CLI**: Test queries directly from command line

## 📊 Data Sources

- **MGI PhenoGenoMP**: Mouse genome phenotype-genotype associations (~390k records)
- **VOC Mammalian Phenotype**: Phenotype vocabulary with descriptions (~15k terms)
- **Curated Genes**: 10 well-characterized genes (Tyr, Lep, Kit, Pax6, etc.)

## 🏗️ Architecture

```
User Query → Embedding → Vector Search (ChromaDB) → Aggregation → Ranked Results → JSON Response
```

### Components

1. **Data Processor**: Parses MGI data and creates enriched gene-phenotype records
2. **Vector Store**: ChromaDB with sentence-transformers embeddings
3. **RAG Engine**: Query pipeline with semantic search and result aggregation
4. **FastAPI**: REST API for frontend integration
5. **CLI**: Interactive testing tool

## 🚀 Setup

### Prerequisites

- Python 3.9+
- ~2GB disk space for data and embeddings

### Installation

1. **Clone and navigate to directory**:
```bash
cd rag-system
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Build the vector database** (one-time setup):
```bash
python scripts/build_vector_db.py
```

This will:
- Parse MGI data files (~390k records)
- Filter for curated genes
- Generate embeddings (~1,000 gene-phenotype pairs)
- Build ChromaDB index

Expected time: 5-10 minutes

## 💻 Usage

### Interactive CLI

Test queries directly:

```bash
python scripts/cli.py
```

Example queries:
- "create a fat mouse"
- "albino mouse"
- "mouse without eyes"
- "white coat color"

### REST API

Start the API server:

```bash
uvicorn api.main:app --reload --port 8000
```

API documentation: http://localhost:8000/docs

#### Example API Request

```bash
curl -X POST "http://localhost:8000/query" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "create a fat mouse", "top_k": 5}'
```

#### Example API Response

```json
{
  "query": "create a fat mouse",
  "genes": [
    {
      "gene_symbol": "Lep",
      "gene_name": "Leptin",
      "description": "Hormone that regulates appetite and metabolism",
      "mgi_ids": ["MGI:104663"],
      "alleles": ["Lep<ob>"],
      "phenotypes": [
        {
          "phenotype_id": "MP:0001234",
          "phenotype_name": "increased body weight",
          "phenotype_description": "greater than normal average body weight",
          "relevance_score": 0.95
        }
      ],
      "pubmed_refs": ["12345678"],
      "genetic_backgrounds": ["C57BL/6J"],
      "aggregate_score": 0.92
    }
  ],
  "total_results": 3,
  "search_metadata": {
    "retrieval_time_ms": 145.2,
    "embedding_model": "all-MiniLM-L6-v2",
    "top_k": 5,
    "total_candidates": 1250
  }
}
```

### Test Queries

Run example test cases:

```bash
python scripts/test_queries.py
```

## 📁 Project Structure

```
rag-system/
├── data/
│   ├── MGI_PhenoGenoMP.rpt.txt       # Raw MGI data
│   ├── VOC_MammalianPhenotype.rpt.txt # Phenotype vocabulary
│   └── processed/
│       ├── gene_phenotype_data.json   # Processed data
│       └── chroma_db/                 # Vector database
├── src/
│   ├── config.py                      # Configuration
│   ├── gene_curator.py                # Curated gene list
│   ├── data_processor.py              # Data parsing
│   ├── vector_store.py                # ChromaDB operations
│   ├── rag_engine.py                  # Query pipeline
│   ├── schemas.py                     # Pydantic models
│   └── utils.py                       # Helper functions
├── scripts/
│   ├── build_vector_db.py             # Build database
│   ├── cli.py                         # Interactive CLI
│   └── test_queries.py                # Test cases
├── api/
│   └── main.py                        # FastAPI application
├── prompts/
│   └── overview.md                    # Project documentation
└── requirements.txt
```

## 🎯 Curated Genes (MVP)

| Gene Symbol | Gene Name | Phenotype | Example Use Case |
|-------------|-----------|-----------|------------------|
| **Tyr** | Tyrosinase | Albinism, coat color | "albino mouse" |
| **Lep** | Leptin | Severe obesity | "fat mouse" |
| **Lepr** | Leptin Receptor | Obesity, diabetes | "obese diabetic mouse" |
| **Cpe** | Carboxypeptidase E | Late-onset obesity | "late obesity" |
| **Kit** | KIT Proto-Oncogene | White spotting | "white spotted mouse" |
| **Pax6** | Paired Box 6 | No eyes | "mouse without eyes" |
| **Hoxd13** | Homeobox D13 | Polydactyly | "extra toes" |
| **Mstn** | Myostatin | Increased muscle | "muscular mouse" |
| **Trp53** | Tumor Protein P53 | Cancer resistance | "cancer resistant" |
| **Mc1r** | Melanocortin 1 Receptor | Coat color | "red pigmentation" |

## 🔧 Configuration

Edit `.env` to customize:

```bash
# Copy example config
cp .env.example .env

# Edit settings
CHROMA_DB_PATH=./data/processed/chroma_db
EMBEDDING_MODEL=all-MiniLM-L6-v2
DEFAULT_TOP_K=5
API_PORT=8000
```

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information |
| `/health` | GET | Health check |
| `/genes` | GET | List curated genes |
| `/query` | POST | Query for genes |
| `/docs` | GET | Interactive API docs |

## 🧪 Testing

```bash
# Run test queries
python scripts/test_queries.py

# Start interactive CLI
python scripts/cli.py

# Test API endpoint
curl -X POST "http://localhost:8000/query" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "fat mouse"}'
```

## 🔮 Future Enhancements

- [ ] LLM integration for query decomposition
- [ ] Expand to 50-100 genes
- [ ] Support polygenic traits
- [ ] Phenotype category filtering
- [ ] Confidence scoring based on study count
- [ ] Synonym expansion for better matching
- [ ] Integration with 3D model generation

## 📚 References

- MGI (Mouse Genome Informatics): http://www.informatics.jax.org/
- Sentence Transformers: https://www.sbert.net/
- ChromaDB: https://www.trychroma.com/
- FastAPI: https://fastapi.tiangolo.com/

## 📄 License

Part of the GeneVision project.

## 👥 Authors

Built for GeneVision - Predictive Genetics & Disease Impact Simulator

---

**Need help?** Check the API docs at `/docs` or run the interactive CLI!

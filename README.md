# GeneVision 🧬

**Predictive Genetics & Disease Impact Simulator**

An interactive platform for exploring genetic modifications, visualizing phenotypic changes, and understanding disease mechanisms through AI-powered simulations.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Node 18+](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)

---

## 🎯 Problem Statement

**Lack of accessible genetic visualization tools:**
- Scientists, students, and researchers struggle to visualize how DNA changes affect an organism's appearance or biological functions without expensive lab experiments

**Difficulty understanding disease mechanisms:**
- Hard to grasp how viruses or diseases target specific genes, organs, and biochemical pathways

**Ethical and experimental barriers:**
- Genetic experiments are expensive, time-consuming, and require specialized labs, limiting learning and exploration

---

## 💡 Our Solution

GeneVision provides an interactive platform where users can:

✅ **Predict & Visualize** genetic modifications and their effects on physical traits (color, size, patterns)

✅ **Explore De-Extinction** concepts by simulating ancient gene insertion into living organisms

✅ **Simulate Disease Impact** by showing how viruses affect specific genes, organs, and biochemical pathways

✅ **Educate & Research** with scientifically-backed visualization tools that eliminate the need for expensive experiments

---

## 🚀 Services Offered

### 1. **Genetic Modification Simulator** (Core Engine)

The heart of GeneVision, operating in two distinct modes:

#### **Mode A: AI Architect** (Prompt-to-Simulation) 🤖
- **What:** Natural language to genetic modification
- **How:** Type "Create a muscular mouse" → RAG system finds genes (Mstn) → Generates visual
- **For:** Casual users, educators, quick demonstrations

#### **Mode B: Interactive Workbench** (Manual Lab) 🔬
- **What:** Granular gene-by-gene editing
- **How:** Load organism → Toggle genes on/off with sliders → See real-time changes
- **For:** Researchers, students learning genetics, hypothesis testing

### 2. **De-Extinction Concept Model** 🦣
- **What:** Comparative genomics for evolutionary biology
- **How:** Overlay extinct species genome (Woolly Mammoth) onto modern relative (Asian Elephant)
- **Output:** Hybrid organism visualization + viability score
- **Status:** 🔄 Planned (Phase 2)

### 3. **Disease Impact Explorer** 🦠
- **What:** Visual pathology simulator
- **How:** Select organ (Lungs) → Introduce pathogen (SARS-CoV-2) → See biochemical cascade
- **Output:** Visual narrative of disease progression
- **Status:** 🔄 Planned (Phase 2)

### 4. **Educational Interface** ("GeneVision Academy") 🎓
- **What:** Gamified genetics learning
- **How:** Pre-set missions (e.g., "Breed a blue-eyed fly using Mendelian genetics")
- **For:** Schools, universities, self-learners
- **Status:** 🔄 Planned (Phase 3)

### 5. **Research Support** ("In Silico Hypothesis Testing") 🔬
- **What:** Professional analytical layer
- **Features:**
  - **Off-Target Prediction:** Predict unintended CRISPR side effects
  - **Statistical Validation:** Success probability scores for experiments
  - **Literature Mining:** Published success rates for gene edits
- **For:** Scientists, biotech firms
- **Status:** 🔄 Planned (Phase 3)

---

## 📊 Current Status

### ✅ **Phase 1: RAG-Powered Gene Analysis** (COMPLETE)

**What's Working:**
- Natural language gene queries ("muscular mouse" → Mstn)
- Semantic search across 4,849 gene-phenotype pairs from MGI
- 10 curated genes with confidence scoring (High/Medium/Low)
- AI-generated mouse visualizations (via Stable Diffusion XL)
- Real-time chat interface with gene details

**Tech Stack:**
```
Frontend (React + Vite) ──────┬──── RAG API (FastAPI + ChromaDB)
     Port 5173                │     Port 8000
                              │
                              └──── Image Backend (Express.js + HF API)
                                     Port 3001
```

### 🔄 **Phase 2: 3D Visualization & Disease Simulator** (IN PROGRESS)

**Planned Features:**
- 3D mouse model with real-time morphing
- Texture swapping for color mutations
- Parametric scaling for size changes
- Disease-gene interaction mapping

### 🔄 **Phase 3: Multi-Gene Combinations & Advanced Features** (PLANNED)

**Planned Features:**
- Polygenic trait simulation (multiple genes → complex traits)
- Off-target CRISPR prediction
- Experimental feasibility scoring
- Educational missions and gamification

---

## 🏗️ Architecture

### Current Architecture (Phase 1)

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                  │
│                      Port 5173                              │
│  - Natural language input                                   │
│  - Gene analysis display                                    │
│  - AI-generated image viewer                                │
│  - Confidence badges (★★★ High/★★ Medium/★ Low)             │
└─────────────┬───────────────────────────────┬───────────────┘
              │                               │
    Gene Analysis Request          Image Generation Request
              │                               │
              ▼                               ▼
┌─────────────────────────┐    ┌─────────────────────────────┐
│   RAG API (FastAPI)     │    │ Image Backend (Express.js)  │
│   Port 8000             │    │ Port 3001                   │
│                         │    │                             │
│ ┌─────────────────────┐ │    │ ┌─────────────────────────┐ │
│ │  NLP Pipeline       │ │    │ │  Prompt Engineering     │ │
│ │  - Query parsing    │ │    │ │  - Enhanced phenotype   │ │
│ │  - Keyword detection│ │    │ │    descriptions         │ │
│ └──────────┬──────────┘ │    │ └──────────┬──────────────┘ │
│            │             │    │            │                │
│            ▼             │    │            ▼                │
│ ┌─────────────────────┐ │    │ ┌─────────────────────────┐ │
│ │  ChromaDB           │ │    │ │  Stable Diffusion XL    │ │
│ │  Vector Database    │ │    │ │  (Hugging Face API)     │ │
│ │  - 4,849 phenotypes │ │    │ │  - 10-30s generation    │ │
│ │  - Semantic search  │ │    │ │  - Base64 output        │ │
│ └──────────┬──────────┘ │    │ └─────────────────────────┘ │
│            │             │    │                             │
│            ▼             │    └─────────────────────────────┘
│ ┌─────────────────────┐ │
│ │  Gene Curator       │ │
│ │  - 10 curated genes │ │
│ │  - Confidence calc  │ │
│ │  - Min score filter │ │
│ └─────────────────────┘ │
│                         │
└─────────────────────────┘
```

### Planned Architecture (Phase 2-3)

```
                     ┌──────────────────────┐
                     │   Frontend           │
                     │   - 3D Viewer        │
                     │   - Interactive Lab  │
                     └──────────┬───────────┘
                                │
                  ┌─────────────┴─────────────┐
                  │                           │
         ┌────────▼────────┐         ┌───────▼────────┐
         │  RAG System     │         │  3D Engine     │
         │  (Current)      │         │  (Phase 2)     │
         └─────────────────┘         └────────────────┘
                                              │
                              ┌───────────────┼───────────────┐
                              │               │               │
                     ┌────────▼────┐  ┌──────▼─────┐  ┌─────▼──────┐
                     │  Blender    │  │  Three.js  │  │  Morphing  │
                     │  Shape Keys │  │  Renderer  │  │  Engine    │
                     └─────────────┘  └────────────┘  └────────────┘
```

---

## 🧬 Curated Genes (Phase 1)

| Gene | Full Name | Phenotype | Use Case |
|------|-----------|-----------|----------|
| **Tyr** | Tyrosinase | Albinism (white coat) | Pigmentation studies |
| **Mc1r** | Melanocortin 1 Receptor | Red/yellow/brown coat | Color variation |
| **Kit** | KIT Proto-Oncogene | White spotting patterns | Pattern formation |
| **Lep** | Leptin | Severe obesity | Metabolism research |
| **Lepr** | Leptin Receptor | Obesity + diabetes | Metabolic syndrome |
| **Cpe** | Carboxypeptidase E | Late-onset obesity | Aging studies |
| **Pax6** | Paired Box 6 | Eye development defects | Developmental biology |
| **Hoxd13** | Homeobox D13 | Polydactyly (extra digits) | Limb development |
| **Mstn** | Myostatin | Increased muscle mass | Muscle research |
| **Trp53** | Tumor Protein 53 | Cancer susceptibility | Oncology |

**Note:** Phase 1 focuses on **monogenic traits** (single gene = clear outcome) for MVP simplicity. Polygenic traits coming in Phase 3.

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- 8GB+ RAM (for embeddings)
- Hugging Face API token (for image generation)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gene-vision
   ```

2. **Set up Hugging Face API**
   
   Create `backend/.env`:
   ```bash
   HF_API_TOKEN=your_huggingface_token_here
   PORT=3001
   ```
   
   Get your token at: https://huggingface.co/settings/tokens

3. **Install dependencies**
   
   ```bash
   # RAG System
   cd rag-system
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   
   # Image Backend
   cd ../backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

4. **Build vector database** (first time only, ~5 minutes)
   ```bash
   cd rag-system
   source venv/bin/activate
   python scripts/build_db.py
   ```

### Running the Application

**Quick Start (Recommended):**
```bash
chmod +x start.sh
./start.sh
```

**Stop All Services:**
```bash
./stop.sh
```

**Manual Start (3 terminals):**

Terminal 1 - RAG API:
```bash
cd rag-system
source venv/bin/activate
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

Terminal 2 - Image Backend:
```bash
cd backend
node server.js
```

Terminal 3 - Frontend:
```bash
cd frontend
npm run dev
```

### Access URLs

- **Frontend**: http://localhost:5173
- **RAG API Docs**: http://localhost:8000/docs
- **Health Checks**: 
  - RAG: http://localhost:8000/health
  - Image: http://localhost:3001/health

---

## 💻 Usage Examples

### Example Queries

| Query | Gene | Confidence | Phenotype Description |
|-------|------|------------|----------------------|
| "muscular mouse" | **Mstn** | ★★★ High | Myostatin knockout → 2x muscle mass |
| "pink fur" | **Mc1r** | ★★ Medium | Melanocortin receptor mutation → reddish coat |
| "white fur" | **Kit** | ★★★ High | KIT proto-oncogene → white spotting |
| "obese mouse" | **Lep** | ★ Low | Leptin deficiency → severe obesity (ob/ob) |
| "3 leg mouse" | **Hoxd13** | ★★★ High | Hox gene mutation → limb development defects |
| "eyeless mouse" | **Pax6** | ★★★ High | Pax6 knockout → anophthalmia |

### API Examples

**Query genes:**
```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "muscular mouse",
    "top_k": 5
  }'
```

**Response:**
```json
{
  "query": "muscular mouse",
  "genes": [
    {
      "gene_symbol": "Mstn",
      "gene_name": "Myostatin",
      "description": "Negative regulator of muscle growth",
      "aggregate_score": 0.0666,
      "confidence_level": "high",
      "phenotypes": [...],
      "alleles": [...],
      "pubmed_refs": [...]
    }
  ],
  "total_results": 1,
  "warning": null
}
```

---

## 🔬 How It Works

### RAG Pipeline (Current Implementation)

```
User Input: "muscular mouse"
    ↓
[1] Keyword Detection
    - Scans for impossible traits (e.g., "5 legs")
    - Returns biological warnings if needed
    ↓
[2] Embedding Generation
    - Converts query to 384-dim vector
    - Model: sentence-transformers/all-MiniLM-L6-v2
    ↓
[3] Vector Search in ChromaDB
    - Searches 4,849 gene-phenotype pairs
    - Uses cosine similarity
    - Retrieves top 15 candidates
    ↓
[4] Gene Aggregation
    - Groups phenotypes by gene
    - Calculates aggregate score per gene
    ↓
[5] Curated Gene Filter
    - Filters to 10 curated genes
    - Applies minimum score threshold (0.01)
    ↓
[6] Confidence Calculation
    - High: score ≥ 0.04
    - Medium: 0.02 ≤ score < 0.04
    - Low: 0.01 ≤ score < 0.02
    ↓
[7] Return Top K Results
    - Default: top 5 genes
```

### Image Generation Pipeline (Current)

```
Gene Results + User Query
    ↓
[1] Prompt Engineering
    - Combines user intent with phenotype details
    - Adds technical specifications
    - Example: "Laboratory mouse with Mstn knockout, 
               exhibiting increased muscle mass..."
    ↓
[2] Send to Stable Diffusion XL
    - Hugging Face Inference API
    - num_inference_steps: 50
    - guidance_scale: 12
    ↓
[3] Receive Base64 Image
    - 10-30 second generation time
    ↓
[4] Display in Frontend
    - Shown alongside gene analysis
```

---

## 📁 Project Structure

```
gene-vision/
├── backend/                    # Image generation service
│   ├── server.js              # Express API + HF proxy
│   ├── package.json
│   └── .env                   # HF_API_TOKEN
│
├── frontend/                   # React UI
│   ├── src/
│   │   ├── App.jsx
│   │   ├── ReconstructionPanel.jsx  # Mode A: AI Architect
│   │   ├── GeneDetails.jsx          # Gene info sidebar
│   │   └── InteractiveLab.jsx       # Mode B: Workbench (WIP)
│   ├── package.json
│   └── vite.config.js
│
├── rag-system/                 # RAG engine
│   ├── src/
│   │   ├── main.py            # FastAPI app
│   │   ├── rag_engine.py      # Core RAG logic
│   │   ├── gene_curator.py    # 10 curated genes
│   │   └── schemas.py         # Pydantic models
│   ├── scripts/
│   │   └── build_db.py        # Vector DB builder
│   ├── data/
│   │   └── MGI_GenePheno_*.rpt  # MGI phenotype data
│   ├── prompts/
│   │   └── overview.md        # Full project vision
│   ├── chromadb_storage/      # Vector database
│   └── requirements.txt
│
├── start.sh                    # Start all services
├── stop.sh                     # Stop all services
└── README.md                   # This file
```

---

## ⚠️ Known Issues & Limitations

### Current Limitations (Phase 1)

**Gene Coverage:**
- ✅ Monogenic traits (single gene = single trait)
- ❌ Polygenic traits (multiple genes → complex trait)
- ❌ Epistatic interactions (gene-gene interactions)

**Visual Representation:**
- ✅ AI-generated static images
- ❌ 3D interactive models (Phase 2)
- ❌ Real-time morphing (Phase 2)

**Trait Types Supported:**
- ✅ Pigmentation (colors, patterns)
- ✅ Size/body weight
- ❌ Structural morphology (extra limbs, missing organs)
- ❌ Behavioral traits

### Image Generation Issue

**Status:** Hugging Face API credits depleted

**Impact:**
- Gene analysis: ✅ Working perfectly
- Image generation: ⚠️ Shows error message
- User experience: Gracefully degraded

**Solutions:**
1. Add HF credits: https://huggingface.co/settings/billing ($9/month PRO)
2. Switch to Replicate API: ~$0.002 per image
3. Deploy local Stable Diffusion: Requires GPU

---

## 🛣️ Roadmap

### ✅ Phase 1: RAG-Powered Gene Analysis (COMPLETE)
- [x] Natural language gene search
- [x] ChromaDB vector database
- [x] 10 curated genes with confidence scoring
- [x] AI image generation
- [x] Chat interface

### 🔄 Phase 2: 3D Visualization (Q1 2025)
- [ ] Interactive 3D mouse model (Three.js/Blender)
- [ ] Real-time texture swapping for colors
- [ ] Parametric scaling for size changes
- [ ] Mode B: Interactive Workbench with gene sliders
- [ ] Disease-gene interaction visualizations

### 🔄 Phase 3: Advanced Features (Q2 2025)
- [ ] Polygenic trait simulation
- [ ] Off-target CRISPR prediction
- [ ] Experimental feasibility scoring
- [ ] Literature mining (PubMed integration)
- [ ] Educational missions ("GeneVision Academy")

### 🔄 Phase 4: De-Extinction Module (Q3 2025)
- [ ] Comparative genomics tool
- [ ] Extinct species genome overlay
- [ ] Hybrid organism viability scoring
- [ ] Woolly Mammoth/Asian Elephant demo

---

## 🧪 Development

### Adding New Curated Genes

Edit `rag-system/src/gene_curator.py`:

```python
CURATED_GENES = {
    "Foxn1": "Hairless phenotype",      # Add new gene
    "Fgf5": "Long hair phenotype",      # Add new gene
    # ... existing genes
}
```

Rebuild vector database:
```bash
cd rag-system
python scripts/build_db.py
```

### Adjusting Confidence Thresholds

Edit `rag-system/src/rag_engine.py`:

```python
def calculate_confidence_level(self, aggregate_score: float) -> str:
    if aggregate_score >= 0.04:    # Adjust threshold
        return "high"
    elif aggregate_score >= 0.02:  # Adjust threshold
        return "medium"
    else:
        return "low"
```

### Changing Minimum Score Filter

Edit `rag-system/src/rag_engine.py`:

```python
MINIMUM_SCORE_THRESHOLD = 0.01  # Lower = more results, higher = fewer
```

---

## 📚 Data Sources

- **MGI (Mouse Genome Informatics)**: Primary gene-phenotype database
  - File: `MGI_GenePheno.rpt`
  - 4,849 gene-phenotype pairs indexed
  - Source: http://www.informatics.jax.org/downloads/reports/

- **IMPC (International Mouse Phenotyping Consortium)**: Validation data
- **PubMed**: Literature references (17,000+ papers linked)

---

## 🤝 Contributing

We welcome contributions! Priority areas:

1. **3D Modeling**: Help build the Interactive Workbench
2. **Gene Curation**: Suggest additional genes to include
3. **Disease Simulation**: Design the Disease Impact Explorer
4. **Educational Content**: Create missions for GeneVision Academy
5. **Testing**: Add unit tests and integration tests

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **MGI (Mouse Genome Informatics)** - Gene-phenotype data
- **Hugging Face** - Model hosting and inference API
- **ChromaDB** - Vector database
- **Sentence Transformers** - Embedding models
- **Stability AI** - Stable Diffusion XL

---

## 📧 Contact

For questions, collaborations, or feedback:
- Open a GitHub issue
- Email: [your-email]
- Twitter: [@your-handle]

---

**GeneVision** - Making genetics accessible, visual, and interactive

*Built for scientists, educators, and the curious minds exploring the future of genetic engineering*

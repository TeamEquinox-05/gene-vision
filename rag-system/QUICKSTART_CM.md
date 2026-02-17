# GeneVision RAG - Quick Start for Chief Minister Presentation

## 🚀 Setup in 3 Steps (Total Time: ~15 minutes)

### Step 1: Install Environment (2 minutes)

**Windows:**
```cmd
cd rag-system
setup_env.bat
```

**Wait for:** "✅ Environment setup complete!"

---

### Step 2: Activate & Build Database (12 minutes)

```cmd
conda activate genevision-rag
python scripts/build_vector_db.py
```

**What you'll see:**
```
========================================================================
🚀 GeneVision RAG System - Vector Database Builder
   MODE: Production (ALL Genes)
========================================================================

📊 STEP 1: Processing raw MGI data...
✅ Parsed 218,847 records
✅ Parsed 13,845 phenotype definitions
✅ Created 218,847 enriched records
✅ Aggregated data for 11,416 genes

🔧 STEP 2: Building vector database...
✅ Loaded data for 11,416 genes
📊 Total gene-phenotype pairs: 250,489
🔧 Generating embeddings and adding to ChromaDB...
   ⏳ Progress: 50,000/250,489 (20.0%)
   ...
✅ Ingested 250,489 gene-phenotype pairs

✨ Vector database build complete!
📊 Indexed 250,489 gene-phenotype pairs
🧬 Covering 11,416 genes
```

---

### Step 3: Test the System (1 minute)

```cmd
python scripts/test_queries.py
```

**Expected Output:**
```
🔍 Query: 'muscular mouse'
  📊 Retrieved 15 candidate gene-phenotype pairs
  🧬 Aggregated into 8 unique genes
  🎯 Filtered to 5 genes

📋 Results for: 'muscular mouse'

1. Mstn (Myostatin) ⭐
   Score: 0.085 (HIGH confidence)
   Top phenotypes:
     • increased muscle mass (score: 0.892)
     • muscle hypertrophy (score: 0.845)

2. Acvr2b (Activin receptor 2B)
   Score: 0.042 (MEDIUM confidence)
   Top phenotypes:
     • increased muscle weight (score: 0.678)
```

---

## 🎯 Demo Queries for Chief Minister

Try these queries to showcase the system:

### Query 1: Muscle Research
```
"muscular mouse"
```
**Result:** Mstn gene (Myostatin) - creates super-strong mice

### Query 2: Obesity/Diabetes Research
```
"obese mouse"
```
**Result:** Lep gene (Leptin) - models metabolic disorders

### Query 3: Cancer Research
```
"tumor suppressor"
```
**Result:** Trp53 gene - critical for cancer studies

### Query 4: Pigmentation/Genetics
```
"white coat color"
```
**Result:** Tyr, Kit genes - studies albinism and patterns

---

## 📊 What to Highlight in Presentation

### 1. Comprehensive Database
- **11,416 genes** indexed (not just 10!)
- **250,000+ phenotype relationships**
- Data from authoritative Mouse Genome Informatics (MGI)

### 2. AI-Powered Intelligence
- Understands natural language (no technical jargon needed)
- Semantic search (knows "fat" means "obesity")
- Confidence scoring (High/Medium/Low reliability)

### 3. Scientific Backing
- 17,000+ research papers linked
- Used by researchers worldwide
- Production-ready infrastructure

---

## 🔧 If Something Goes Wrong

### Quick Recovery Options

**Option 1: Demo Mode (2 minutes to rebuild)**
```cmd
python scripts/build_vector_db.py --curated
```
Uses only 10 curated genes, builds in 2 minutes.

**Option 2: Test with Pre-built Queries**
```cmd
python scripts/cli.py
```
Interactive command-line interface.

**Option 3: Restart API Server**
```cmd
cd ..
uvicorn api.main:app --host 0.0.0.0 --port 8000
```

---

## 📱 Access Points

Once running, access at:

- **API Documentation:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health  
- **Query Endpoint:** POST http://localhost:8000/query

---

## ✅ Pre-Presentation Checklist

- [ ] Environment installed (`setup_env.bat`)
- [ ] Database built successfully (Step 2)
- [ ] Test queries working (Step 3)
- [ ] Tested at least 3 demo queries
- [ ] API server accessible
- [ ] Frontend connected (if using web interface)

---

## 🎤 Presentation Script

**Opening:**
> "We've built an AI-powered genetic research platform that indexes over 11,000 genes and 250,000 phenotype relationships from the world's most authoritative mouse genetics database."

**Demo:**
> "Let me show you - I'll type a simple query like 'muscular mouse'... and in less than a second, the system identifies the Myostatin gene with high confidence, shows us the phenotypes, and links to thousands of research papers."

**Impact:**
> "This technology accelerates genetic research by making decades of scientific knowledge instantly searchable through natural language - no PhD required."

---

**Ready for Chief Minister! 🚀**

For detailed technical information, see: `PRODUCTION_GUIDE.md`

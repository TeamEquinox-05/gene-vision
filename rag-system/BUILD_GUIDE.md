# 🚀 Building the Vector Database with Progress Tracking

## ✨ What's New

I've updated the database building scripts with:

✅ **Beautiful Progress Bars** - See exactly what's happening with `tqdm` progress bars  
✅ **Verbose Logging** - Detailed output for each processing step  
✅ **Resume Capability** - Automatically resumes from where you paused  
✅ **Batch Processing** - Processes data in chunks to prevent memory issues  

---

## 📊 Progress Bars You'll See

### Step 1: Data Processing
```
Parsing MGI data:      100%|████████████| 389763/389763 [00:45<00:00, 8621.4 lines/s]
Parsing phenotype vocab: 100%|██████████| 13845/13845 [00:01<00:00, 12000 lines/s]
Enriching records:      100%|████████████| 350000/350000 [02:30<00:00, 2333 records/s]
Aggregating by gene:   100%|████████████| 350000/350000 [01:15<00:00, 4666 records/s]
```

### Step 2: Vector Database Build
```
Collecting gene data:   100%|████████████| 23000/23000 [00:30<00:00, 766 genes/s]
Vectorizing & indexing: 100%|████████████| 350000/350000 [18:45<00:00, 311 docs/s]
  └─ batch: 3500/3500 | docs: 350,000/350,000
```

---

## 🎮 How to Run

### Option 1: Use the Batch Script (Easiest)
```cmd
cd rag-system
build_database.bat
```

This will:
- ✅ Activate your `genevision` conda environment
- ✅ Run the full database build with progress bars
- ✅ Show you detailed progress for every step
- ✅ Allow you to pause and resume

### Option 2: Manual Command
```cmd
cd rag-system
conda activate genevision
python scripts\build_vector_db.py --batch-size 10000 --embedding-batch-size 100
```

---

## ⏸️ Pausing and Resuming

### To Pause:
Press **Ctrl+C** at any time during processing.

### To Resume:
Just run the same command again:
```cmd
build_database.bat
```

The system will automatically:
1. ✅ Detect existing processed data
2. ✅ Check how many documents are already in ChromaDB
3. ✅ Skip what's already done
4. ✅ Continue from where you left off

### Example Resume Output:
```
✅ Found existing collection 'gene_phenotypes' with 150,000 documents
   Total to process: 350,000
   ⏩ Skipping first 150,000 documents (already processed)
   Processing 200,000 documents starting from index 150,000

Vectorizing & indexing: 43%|███████     | 150000/350000 [09:30<11:15, 311 docs/s]
```

---

## 📈 What Gets Built

### Full Production Database:
- **~23,000 genes** from MGI database
- **~350,000 gene-phenotype pairs** (exact number varies)
- **350,000 embeddings** for semantic search
- **~2-3 GB** ChromaDB database

### Processing Time:
- **Data parsing**: ~5 minutes
- **Data enrichment**: ~3 minutes
- **Data aggregation**: ~2 minutes
- **Vector embedding**: ~15-20 minutes
- **Total**: ~25-30 minutes (depending on CPU)

---

## 🎯 Current Status Check

To check your current database status:
```cmd
python check_status.py
```

This will show:
```
🔍 GeneVision RAG System - Status Check
========================================================================

✅ Processed data file exists
   Size: 117.99 MB
   Total genes: 23,157
   Total gene-phenotype pairs: 350,420
   Curated genes: 10

✅ ChromaDB directory exists
   Documents indexed: 150,000

📋 SUMMARY:

✅ Data processing: COMPLETE
   You have 23,157 genes with 350,420 associations ready
⚠️  Vector database: INCOMPLETE (only 150,000 / 350,420 indexed)
   Run: python scripts\build_vector_db.py
```

---

## 🔧 Command Line Options

### Batch Sizes
```cmd
# Larger batches = faster but more memory
python scripts\build_vector_db.py --embedding-batch-size 200

# Smaller batches = slower but less memory
python scripts\build_vector_db.py --embedding-batch-size 50
```

### Demo Mode (Only Curated Genes)
```cmd
# Quick test with only 10 curated genes
python scripts\build_vector_db.py --curated
```

---

## 🐛 Troubleshooting

### "Python not found"
```cmd
# Make sure conda environment is activated
conda activate genevision

# Install Python if needed
conda install python=3.11
```

### "Import errors"
```cmd
# Install requirements
pip install -r requirements.txt
```

### "Out of memory"
```cmd
# Use smaller batch sizes
python scripts\build_vector_db.py --embedding-batch-size 50
```

### "Collection already exists" error
The system automatically handles existing collections. If you want to start fresh:
```python
# The script automatically resets the collection
# No manual intervention needed
```

---

## 📊 Progress Bar Colors

The progress bars use different colors for different stages:
- 🔵 **Blue** - Parsing MGI data
- 💜 **Magenta** - Parsing phenotype vocabulary
- 💛 **Yellow** - Enriching records
- 💚 **Green** - Aggregating by gene / Vector indexing
- 🩵 **Cyan** - Collecting gene data

---

## ✅ Success Indicators

You'll know it's working when you see:
```
✨ SUCCESS! Vector database is ready to use.
========================================================================

Next steps:
  1. Test queries: python scripts/test_queries.py
  2. Run CLI: python scripts/cli.py
  3. Start API: cd .. && uvicorn api.main:app --host 0.0.0.0 --port 8000
```

---

## 🎉 After Building

Once complete, you can:

1. **Test the system:**
   ```cmd
   python scripts\test_queries.py
   ```

2. **Start the API:**
   ```cmd
   python api\main.py
   ```

3. **Run the full stack:**
   ```cmd
   cd ..
   start.sh  # or manually start all 3 services
   ```

---

**Happy Building! 🧬🚀**

Your complete gene database with ~350K associations will be ready in about 25 minutes!

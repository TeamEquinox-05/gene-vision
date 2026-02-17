# 🚀 GeneVision - Complete Startup Guide

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- ✅ Vector database built (check with: `cd rag-system && python check_current_db.py`)
- ✅ Conda environment `genevision` created and activated
- ✅ Node.js installed
- ✅ All dependencies installed

---

## 🎮 Quick Start (Automatic)

### Option 1: One-Click Startup (Windows)

```cmd
start_all.bat
```

This will open 3 terminal windows automatically!

---

## 🔧 Manual Startup (Step by Step)

If you prefer to start services manually or the batch file doesn't work:

### **Terminal 1: RAG API Server**

```cmd
cd rag-system
conda activate genevision
python api\main.py
```

**Wait for:**
```
✅ RAG engine loaded!
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Test it:** Open http://localhost:8000/docs

---

### **Terminal 2: Image Backend Server**

Open a **NEW terminal window**:

```cmd
cd backend
node server.js
```

**Wait for:**
```
🖼️  Image generation server running on port 3001
```

**Test it:** Open http://localhost:3001/health

---

### **Terminal 3: Frontend Development Server**

Open a **NEW terminal window**:

```cmd
cd frontend
npm run dev
```

**Wait for:**
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Open it:** http://localhost:5173

---

## 🌐 Access URLs

Once all services are running:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Main web interface |
| **RAG API** | http://localhost:8000 | Gene search API |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| **Image Backend** | http://localhost:3001 | Image generation service |
| **Health Check** | http://localhost:3001/health | Backend health status |

---

## ✅ Verification Steps

### 1. Check RAG API
Open: http://localhost:8000/health

Should return:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "genes_indexed": 19284,
  "phenotypes_indexed": 22450
}
```

### 2. Check Image Backend
Open: http://localhost:3001/health

Should return:
```json
{
  "status": "ok",
  "service": "image-generation"
}
```

### 3. Check Frontend
Open: http://localhost:5173

Should see the GeneVision interface.

---

## 🧪 Test the System

### From Frontend (Easiest)

1. Open http://localhost:5173
2. Enter a query: **"muscular mouse"**
3. Click "Generate"
4. You should see:
   - Gene results (Mstn)
   - Confidence scores
   - Phenotype details

### From API Docs (For Testing)

1. Open http://localhost:8000/docs
2. Click on **POST /query**
3. Click **"Try it out"**
4. Enter:
   ```json
   {
     "prompt": "muscular mouse",
     "top_k": 5
   }
   ```
5. Click **"Execute"**
6. See the JSON response with genes

### Using curl (Command Line)

```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"prompt": "muscular mouse", "top_k": 5}'
```

---

## 🎯 Example Queries to Try

| Query | Expected Gene | What It Shows |
|-------|---------------|---------------|
| **"muscular mouse"** | Mstn | Myostatin knockout |
| **"obese mouse"** | Lep, Lepr | Leptin system |
| **"white fur"** | Tyr, Kit | Pigmentation |
| **"big mouse"** | Lep | Body size |
| **"albino"** | Tyr | Tyrosinase mutation |

---

## 🛑 Stopping Services

### Stop Individual Services
In each terminal window, press: **Ctrl+C**

### Stop All Services (Windows)
If you have multiple CMD windows open, close them individually or:

```cmd
taskkill /F /IM node.exe
taskkill /F /IM python.exe
```

⚠️ **Warning:** This will kill ALL Node.js and Python processes!

---

## 🐛 Troubleshooting

### Issue: "Port already in use"

**For RAG API (Port 8000):**
```cmd
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**For Image Backend (Port 3001):**
```cmd
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**For Frontend (Port 5173):**
```cmd
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

---

### Issue: "RAG engine not initialized"

**Cause:** Vector database not built

**Solution:**
```cmd
cd rag-system
python check_current_db.py
```

If it shows 0 documents, build it:
```cmd
build_demo.bat    # For quick demo (2 min)
# OR
build_20k.bat     # For 20K documents (20 min)
```

---

### Issue: "Module not found" errors

**For RAG system:**
```cmd
cd rag-system
conda activate genevision
pip install -r requirements.txt
```

**For Backend:**
```cmd
cd backend
npm install
```

**For Frontend:**
```cmd
cd frontend
npm install
```

---

### Issue: "Image generation not working"

**Cause:** Hugging Face API credits depleted (mentioned in docs)

**Solutions:**
1. Add HF credits: https://huggingface.co/settings/billing
2. Use system without images (gene search still works perfectly!)
3. The frontend will show error message but gene queries work fine

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                  │
│                      Port 5173                              │
│  - Natural language input                                   │
│  - Gene analysis display                                    │
│  - AI-generated image viewer                                │
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
│ │  ChromaDB           │ │    │ │  Stable Diffusion XL    │ │
│ │  Vector Database    │ │    │ │  (Hugging Face API)     │ │
│ │  - 22,450 docs      │ │    │ └─────────────────────────┘ │
│ └─────────────────────┘ │    │                             │
└─────────────────────────┘    └─────────────────────────────┘
```

---

## 🎉 Success Indicators

You'll know everything is working when:

✅ **RAG API:** Shows "RAG engine loaded!" in terminal  
✅ **Image Backend:** Shows "server running on port 3001"  
✅ **Frontend:** Vite dev server shows local URL  
✅ **Browser:** GeneVision interface loads at localhost:5173  
✅ **Queries:** Typing "muscular mouse" returns Mstn gene  

---

## 💡 Pro Tips

### 1. **Keep Terminals Open**
Don't close the terminal windows - they need to keep running!

### 2. **Check Logs**
Each terminal shows real-time logs. Watch for errors there.

### 3. **Test Each Service**
Use the health check URLs to verify each service independently.

### 4. **Start Order Doesn't Matter**
You can start services in any order, but RAG API takes longest to load.

### 5. **Hot Reload**
Frontend has hot reload - code changes reflect immediately!

---

## 🚀 You're Ready!

Your complete GeneVision system should now be running!

**Open:** http://localhost:5173

**Try query:** "muscular mouse"

**Enjoy your AI-powered genetic research platform!** 🧬✨

---

## 📞 Quick Reference Commands

```bash
# Check database status
cd rag-system && python check_current_db.py

# Start RAG API
cd rag-system && conda activate genevision && python api\main.py

# Start Image Backend
cd backend && node server.js

# Start Frontend
cd frontend && npm run dev

# Stop service
Press Ctrl+C in the respective terminal
```

---

**Need help? Check the troubleshooting section above!** 🆘

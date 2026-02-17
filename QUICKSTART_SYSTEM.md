# 🎮 Quick Start - GeneVision

## 🚀 Start Everything (1 Command)

```cmd
start_all.bat
```

This opens 3 terminals automatically!

---

## 🔧 Or Start Manually (3 Terminals)

### Terminal 1: RAG API
```cmd
cd rag-system
conda activate genevision
python api\main.py
```
Wait for: `✅ RAG engine loaded!`

### Terminal 2: Image Backend
```cmd
cd backend
node server.js
```
Wait for: `🖼️ server running on port 3001`

### Terminal 3: Frontend
```cmd
cd frontend
npm run dev
```
Wait for: `➜ Local: http://localhost:5173/`

---

## 🌐 Open Your Browser

**Main App:** http://localhost:5173

Try query: **"muscular mouse"**

---

## ✅ Test Individual Services

- **RAG API:** http://localhost:8000/docs
- **Image Health:** http://localhost:3001/health
- **Frontend:** http://localhost:5173

---

## 🛑 Stop Services

Press **Ctrl+C** in each terminal

---

## 🆘 If Something's Wrong

### Database not ready?
```cmd
cd rag-system
python check_current_db.py
```

### Port already in use?
```cmd
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Module errors?
```cmd
cd rag-system
pip install -r requirements.txt

cd ../backend
npm install

cd ../frontend
npm install
```

---

## 🎯 Example Queries

- "muscular mouse" → Mstn
- "obese mouse" → Lep, Lepr
- "white fur" → Tyr, Kit
- "albino" → Tyr

---

**That's it! Your system is ready!** 🧬✨

Full guide: See `STARTUP_GUIDE.md`

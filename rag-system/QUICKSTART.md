# 🚀 Quick Start Guide - 16GB RAM Optimized

## ✅ TL;DR - I'm Ready to Build!

```cmd
cd rag-system
build_database.bat
```

**That's it!** Everything is optimized for your 16GB RAM.

---

## 💡 Before You Start (30 seconds)

**Close these RAM hogs:**
- ✅ Chrome/Edge (saves 2-4GB)
- ✅ Games or heavy apps

**Keep these open (fine):**
- ✅ VS Code
- ✅ Terminal
- ✅ Music/Discord

---

## 📊 What You'll See

### 1. RAM Check
```
💾 RAM Status: 8.5GB available / 16.0GB total
✅ RAM looks good (8.5GB available)
```

### 2. Beautiful Progress Bars
```
Parsing MGI data:       100%|████████| 389763/389763 [00:45<00:00]
Vectorizing & indexing:  43%|██████  | 150000/350420 [18:30<24:15]
  └─ batch: 3000/7009 | docs: 150,000/350,420 | RAM: 6.2GB
```

### 3. Completion
```
✅ Successfully ingested all documents!
📊 Total documents in collection: 350,420
🧬 Covering 23,157 genes
```

---

## ⏱️ How Long?

**~38 minutes total** with safe RAM usage

- Data Processing: ~13 min
- Vector Building: ~25 min

---

## ⏸️ Can I Pause?

**YES!** Press `Ctrl+C` anytime.

To resume: Run `build_database.bat` again.

System automatically continues from where you stopped.

---

## 💾 RAM Usage

**Your system is safe:**

| Stage | RAM Used | Your Free RAM |
|-------|----------|---------------|
| Start | 3 GB | ~13 GB ✅ |
| Peak | 6 GB | ~10 GB ✅ |
| Final | 3 GB | ~13 GB ✅ |

**No lag, no crashes, no worries!**

---

## 🎯 Quick Checklist

Before running:
- [ ] Closed Chrome/heavy apps
- [ ] In `rag-system` directory
- [ ] Conda env `genevision` ready (script activates it)

During running:
- [ ] Watch the progress bars
- [ ] RAM indicator shows available GB
- [ ] Can pause anytime with Ctrl+C

After completion:
- [ ] Test with: `python scripts\test_queries.py`
- [ ] Start API: `python api\main.py`

---

## 🆘 Help!

### "Low RAM warning"
👉 Pause (Ctrl+C), close apps, resume

### "Want to go faster"
👉 Close everything, use:
```cmd
python scripts\build_vector_db.py --batch-size 10000 --embedding-batch-size 100
```

### "Want to go slower/safer"
👉 Use:
```cmd
python scripts\build_vector_db.py --batch-size 2500 --embedding-batch-size 25
```

---

## 📚 Full Guides

- **RAM Details**: See `RAM_OPTIMIZATION.md`
- **Build Guide**: See `BUILD_GUIDE.md`
- **All Updates**: See `UPDATES.md`

---

## 🎉 You're Ready!

```cmd
cd rag-system
build_database.bat
```

Sit back and watch the magic happen! ✨🧬

**Processing ~350K gene-phenotype associations with beautiful progress bars and safe RAM usage!**

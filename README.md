# 🧬 GeneVision — AI-Powered Gene Reconstruction Lab

GeneVision is an interactive AI-powered platform that enables users to **simulate, visualize, and evolve genetic traits** by generating realistic organism images (rats) from phenotype descriptions using Stable Diffusion XL.

It combines **natural language input, real-time controls, and generative AI** to create an intuitive gene-to-visualization experience.

---

## 🚀 Features

### 🧠 Reconstruction Mode (AI Chat Interface)
- Describe organism traits in natural language  
- Generates realistic images using Stable Diffusion XL  
- Provides mock gene modification insights  
- Converts phenotype descriptions into structured prompts  

### 🧬 Evolution Mode (Interactive Customization)
- Adjust traits using sliders:
  - Body size, leg length, ear size, tail length, etc.
- Customize:
  - Colors (body, eyes, tail, nose)
  - Fur patterns, textures, and body types
- Real-time prompt preview  
- One-click generation of evolved organisms  

---

## 🏗️ Architecture

```
Frontend (React + Vite)
        │
        ▼
Express Backend Proxy (Node.js)
        │
        ▼
Hugging Face Inference API (Stable Diffusion XL)
```

---

## 🧪 Tech Stack

### Frontend
- React 18 + Vite  
- Tailwind CSS  

### Backend
- Node.js + Express  
- Proxy server for API security & CORS handling  

### AI / ML
- Stable Diffusion XL (`stabilityai/stable-diffusion-xl-base-1.0`)  
- Hugging Face Inference API  

---

## 🔑 Setup Instructions

### 1. Get Hugging Face API Token
- Go to https://huggingface.co  
- Create an **Access Token** (read permissions)  
- Copy token (`hf_...`)  

---

### 2. Configure Backend

```bash
cd backend
```

Create `.env` file:

```env
HF_API_TOKEN=hf_your_token_here
```

⚠️ Never commit `.env` to GitHub  

---

## ▶️ Running the Project

### ⚠️ You MUST run both servers

---

### 🖥️ Backend (Port 3001)

```bash
cd backend
npm install
npm start
```

---

### 🌐 Frontend (Port 5173)

```bash
cd frontend
npm install
npm run dev
```

---

### 🌍 Access App

- Frontend: http://localhost:5173  
- Backend: http://localhost:3001  

---

## 🎨 How to Use

### 🔹 Reconstruction Panel
Describe organism traits like:

```
black fur, red eyes, long tail, 3 legs
```

- AI generates:
  - Image  
  - Gene insights  

---

### 🔹 Evolution Panel
- Adjust sliders and dropdowns  
- Customize physical and visual traits  
- Click **Generate**  
- View evolved organism instantly  

---

## 📡 API Endpoints

### POST `/api/generate-image`

```json
{
  "prompt": "A photorealistic laboratory rat..."
}
```

**Response:**
```json
{
  "success": true,
  "image": "base64-image-data"
}
```

---

### GET `/health`

```json
{
  "status": "ok",
  "message": "Gene Lab Proxy Server Running"
}
```

---

## ⚠️ Why Backend Proxy?

Hugging Face APIs **do not support CORS**, so the backend:

- Secures API keys  
- Handles API requests  
- Prevents direct exposure in frontend  

---

## 🐛 Troubleshooting

### ❌ Image not generating
- Wait 20–30 seconds (model cold start)  
- Check backend logs  
- Verify API token  

### ❌ CORS / Failed to fetch
- Ensure backend is running on port 3001  

### ❌ Token issues
- Check `.env` formatting  
- Restart backend  

---

## 💰 Pricing

- Free tier available (limited speed)  
- PRO: ~$9/month for faster inference  

---

## 🔒 Security

- API keys stored in `.env`  
- `.env` excluded via `.gitignore`  
- Never expose keys in frontend  

---

## 🚧 Roadmap

- [ ] Local LLM integration for gene analysis  
- [ ] Advanced gene-to-phenotype mapping  
- [ ] Generation history & tracking  
- [ ] Export/share generated organisms  

---

## 🧬 Model Info

- Model: Stable Diffusion XL Base 1.0  
- Resolution: 1024×1024  
- Provider: Hugging Face Inference API  

---

## 📌 Vision

GeneVision aims to bridge **genetics, simulation, and AI visualization**, making complex biological concepts interactive and accessible.

---

## ⭐ Contributing

Contributions are welcome! Feel free to fork and improve.

---

## 📜 License

This project is for educational and experimental purposes.

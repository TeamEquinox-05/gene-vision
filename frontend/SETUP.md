# Gene Reconstruction Lab - Setup Instructions

## 🧬 Overview
This project includes an AI-powered image generation feature that allows users to describe rat phenotypes and generate visual representations using Hugging Face's Stable Diffusion XL model. The project consists of a React frontend and an Express.js proxy server to handle API requests.

## 🔑 API Key Setup

### Step 1: Get Your Hugging Face API Token
1. Go to [Hugging Face](https://huggingface.co/)
2. Sign up or log in to your account
3. Navigate to Settings → Access Tokens
4. Create a new token with read permissions
5. Copy the token (it starts with `hf_...`)

### Step 2: Configure Backend
1. Navigate to the `backend` directory
2. Open the `.env` file
3. The token is already configured, but if needed, replace it:
   ```
   HF_API_TOKEN=hf_your-actual-token-here
   ```
4. Save the file

⚠️ **IMPORTANT**: Never commit your `.env` file to version control. It's already added to `.gitignore`.

## 🚀 How to Run

### ⚠️ IMPORTANT: You must run BOTH servers

This project requires two servers to run simultaneously:
1. **Backend Server** (Port 3001) - Handles Hugging Face API requests
2. **Frontend Server** (Port 5173) - Serves the React application

### Step 1: Start the Backend Server

Open a terminal and run:
```bash
cd backend
npm install
npm start
```

You should see:
```
🧬 Gene Lab Proxy Server running on http://localhost:3001
📡 Frontend should connect to: http://localhost:3001/api/generate-image
```

**Keep this terminal running!**

### Step 2: Start the Frontend Server

Open a **NEW terminal** (keep the first one running) and run:
```bash
cd frontend
npm install
npm run dev
```

The frontend will open at `http://localhost:5173`

### Quick Start (Alternative)

You can also open two separate terminals manually:

**Terminal 1 (Backend):**
```bash
cd d:\ideazzzzACTUAL\Gene\backend
npm install
npm start
```

**Terminal 2 (Frontend):**
```bash
cd d:\ideazzzzACTUAL\Gene\frontend
npm install
npm run dev
```

## 🎨 Using the Reconstruction Panel

1. Click on the **"Reconstruction"** tab in the navigation
2. In the chat interface, describe your rat's features:
   - Example: "3 legs, black fur, pink tail, red eyes, larger size"
   - Be specific about colors, sizes, and physical traits
3. Click Send or press Enter
4. Wait for the AI to generate the image (usually 10-30 seconds)
5. View the generated rat image and recommended gene modifications

## 🧬 Using the Evolution Panel

1. Click on the **"Evolution"** tab in the navigation
2. Customize your rat using the controls:
   
   **Physical Features (Sliders):**
   - Body Size
   - Leg Length
   - Tail Length
   - Ear Size
   - Eye Size
   - Snout Length
   - Whisker Length
   - Fur Density
   - Paw Size

   **Color Palette (Click to Select):**
   - Body Color (Brown, White, Black, Gray, Pink, Cream, Auburn, Tan)
   - Tail Color
   - Eye Color
   - Ear Color
   - Nose Color

   **Style Options (Dropdowns):**
   - Fur Pattern: Solid, Spotted, Striped, Patched, Gradient, Mottled
   - Tail Shape: Long & Tapered, Short & Stubby, Thick, Thin, Bushy, Hairless
   - Ear Shape: Rounded, Pointed, Large & Floppy, Small & Perky, Bat-like
   - Fur Texture: Smooth, Fluffy, Coarse, Silky, Wiry
   - Body Build: Slim, Average, Muscular, Stocky, Plump

3. Watch the prompt preview update in real-time as you adjust features
4. Click "Generate Evolved Rat" to create your custom rat
5. View the generated image on the right side
6. Click "Reset" to return all settings to defaults

## 🧪 Features

### Current Features
- ✅ AI-powered rat image generation using Stable Diffusion XL
- ✅ Chat-based interface for describing phenotypes (Reconstruction tab)
- ✅ Slider-based customization interface (Evolution tab)
- ✅ Mock gene modification recommendations
- ✅ Real-time response handling

### In Development
- 🔄 Local LLM integration for detailed gene analysis
- 🔄 More precise gene-to-phenotype mapping
- 🔄 Historical generation tracking

## 💰 Pricing Note
Hugging Face Inference API:
- **Free tier**: Available for community use
- **PRO subscription**: $9/month for faster inference and higher rate limits
- **Enterprise**: Custom pricing for production use

No per-image costs - just account tier limitations!

## 🐛 Troubleshooting

### "Failed to fetch" or CORS Error
- **Make sure the backend server is running!** Check Terminal 1 for the backend
- The backend must be running on `http://localhost:3001`
- Restart both servers if needed

### "Hugging Face API token not configured" Error
- Check the `backend/.env` file exists
- Verify the token is correctly set in `backend/.env` (no extra spaces)
- Restart the backend server after changing `.env`

### Backend Server Won't Start
- Check if port 3001 is already in use
- Kill any existing Node processes: `taskkill /F /IM node.exe` (Windows)
- Try changing the PORT in `backend/.env`

### "Model is loading" or Slow Generation
- Hugging Face models may take 20-30 seconds on first request (cold start)
- Subsequent generations are much faster
- PRO accounts get faster, dedicated inference

### "Failed to generate image" Error
- Verify your API token is valid in `backend/.env`
- Check your Hugging Face account is active
- Ensure your internet connection is stable (backend server needs internet)
- Some prompts may be filtered for safety - try rewording

### Connection Refused Error
- **Backend not running**: Make sure Terminal 1 is running the backend server
- Check the backend server logs for errors
- Verify the backend is accessible at `http://localhost:3001/health`

### Image Not Generating
- Wait at least 30 seconds - Stable Diffusion can take time to load
- Check browser console (F12) for error messages
- Try a simpler prompt first
- If you see "Model is currently loading", wait 1-2 minutes and try again

## 📝 Example Prompts (Reconstruction Tab)

Good prompts:
- "white fur with black spots, 4 legs, long pink tail"
- "completely black fur, red eyes, smaller than average"
- "brown fur, 3 legs, extra large ears, short tail"

The system automatically formats your prompt to focus on rat characteristics.

## 🔒 Security
- Your API token is stored locally in `.env` file
- Never share your `.env` file or commit it to git
- The `.env` file is already in `.gitignore` for protection

## 🎨 Model Information
**Stable Diffusion XL Base 1.0**
- Model: `stabilityai/stable-diffusion-xl-base-1.0`
- Resolution: 1024×1024 pixels
- Style: Photorealistic, high-quality generations
- Hosted on Hugging Face Inference API

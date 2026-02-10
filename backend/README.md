# Gene Lab - Backend Proxy Server

This is a simple Express.js proxy server that handles Hugging Face API requests to avoid CORS issues in the browser.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure your Hugging Face token in `.env`:
```
HF_API_TOKEN=hf_your_token_here
```

3. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### POST /api/generate-image
Generates an image using Stable Diffusion XL

**Request Body:**
```json
{
  "prompt": "A photorealistic laboratory rat..."
}
```

**Response:**
```json
{
  "success": true,
  "image": "data:image/png;base64,..."
}
```

### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "message": "Gene Lab Proxy Server Running"
}
```

## Why a Backend Server?

Hugging Face's Inference API doesn't support CORS (Cross-Origin Resource Sharing) for security reasons. This means browsers can't directly call the API. This proxy server:

1. Receives requests from the frontend (React app)
2. Forwards them to Hugging Face API with proper authentication
3. Returns the generated images to the frontend

This is a common pattern for securing API keys and handling CORS restrictions.

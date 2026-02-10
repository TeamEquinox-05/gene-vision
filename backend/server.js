import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// -----------------------------
// Health Check
// -----------------------------
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "🧬 Gene Lab Proxy Server Running",
  });
});

// -----------------------------
// Image Generation Endpoint
// -----------------------------
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required",
      });
    }

    const HF_TOKEN = process.env.HF_API_TOKEN;

    if (!HF_TOKEN) {
      return res.status(500).json({
        error: "Hugging Face API token not configured",
      });
    }

    console.log("🎨 Phenotype Prompt from Frontend:", prompt);

    // -----------------------------
    // Enhanced Prompt - Emphasize mutations
    // -----------------------------
    const enhancedPrompt = `
High quality scientific photograph of a genetically modified laboratory mouse (Mus musculus).

CRITICAL GENETIC MODIFICATIONS - THESE MUST BE VISIBLE:
${prompt}

Important: If the description mentions "without eyes" or "no eyes" or "eyeless", the mouse MUST have smooth skin where eyes would be, NO visible eyes at all.
If the description mentions "extra legs" or "additional limbs", ALL extra limbs must be clearly visible.
If the description mentions color/fur mutations, the entire body must show the specified coloration.

Style: Photorealistic scientific specimen photography, laboratory setting, white background, detailed anatomy, 4K quality.
`;

    console.log(
      "🧬 Enhanced Prompt:",
      enhancedPrompt.substring(0, 200) + "..."
    );

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
          body: JSON.stringify({
            inputs: enhancedPrompt,
            parameters: {
              num_inference_steps: 50,
              guidance_scale: 12,
              negative_prompt: `
normal mouse with standard anatomy,
cartoon,
anime,
illustration,
painting,
drawing,
blurry,
low quality,
deformed,
poorly drawn,
extra heads,
multiple bodies,
human features,
normal eyes when description says no eyes,
eyes visible when description says eyeless or without eyes
              `,
            },
          }),
      }
    );

    // -----------------------------
    // Handle HF loading / errors
    // -----------------------------
    if (response.status === 503) {
      return res.status(503).json({
        error:
          "Model is loading on Hugging Face. Try again in 10–20 seconds.",
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ HF API Error:", errorText);

      // Check for specific error types
      let errorType = 'api_error';
      let userMessage = 'Image generation temporarily unavailable';
      
      if (errorText.includes('Credit balance is depleted') || 
          errorText.includes('insufficient credits') ||
          response.status === 402 || 
          response.status === 403) {
        errorType = 'credits_depleted';
        userMessage = 'Image generation service requires additional credits';
      } else if (response.status === 429) {
        errorType = 'rate_limit';
        userMessage = 'Too many requests. Please try again in a moment';
      }

      return res.status(response.status).json({
        error: userMessage,
        errorType: errorType,
        details: errorText,
        fallback: true,
      });
    }

    // -----------------------------
    // Convert image → base64
    // -----------------------------
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    res.json({
      success: true,
      image: `data:image/png;base64,${base64Image}`,
    });
  } catch (error) {
    console.error("🔥 Server Error:", error);

    res.status(500).json({
      error: error.message || "Failed to generate image",
    });
  }
});

// -----------------------------
// Start Server
// -----------------------------
app.listen(PORT, () => {
  console.log(
    `🧬 Gene Lab Proxy Server running on http://localhost:${PORT}`
  );
  console.log(
    `📡 Endpoint → http://localhost:${PORT}/api/generate-image`
  );
});

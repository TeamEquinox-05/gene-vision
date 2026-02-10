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

    console.log("🎨 Raw Phenotype Prompt:", prompt);

    // -----------------------------
    // ULTRA-STRICT Mutation Wrapper
    // -----------------------------
    const enhancedPrompt = `
Photorealistic genetically engineered laboratory rat (Rattus norvegicus).

CRITICAL PHENOTYPE REQUIREMENTS — MUST BE VISUALLY PRESENT:

${prompt}.

The rat MUST visibly display these genetic mutations:

- Extra limbs must be fully formed and anatomically attached.
- Multiple tails must extend clearly from the base of the spine.
- Fur color mutations must cover the entire body surface.
- No normal anatomy should remain if mutations are specified.

This is a scientific genetic experiment specimen.

Realistic anatomy despite mutations,
biological experiment subject,
laboratory environment,
hyper realistic,
ultra detailed,
4k photography.
`;

    console.log(
      "🧬 Enhanced Prompt:",
      enhancedPrompt.substring(0, 140) + "..."
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
            guidance_scale: 11,
            negative_prompt: `
normal rat,
four legs,
single tail,
white fur,
natural coloration,
standard anatomy,
unmodified animal,
cartoon,
blurry,
low detail,
deformed but missing mutations,
duplicate body,
extra heads,
disconnected limbs
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

      return res.status(response.status).json({
        error: "Hugging Face API error",
        details: errorText,
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

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoints
  app.get("/api/location", (req, res) => {
    // Mock location data or use a geoip service
    res.json({
      lat: 37.7749,
      lng: -122.4194,
      address: "San Francisco, CA",
    });
  });

  app.get("/api/weather", (req, res) => {
    const { lat, lng } = req.query;
    // Mock weather data
    res.json({
      temp: 24,
      humidity: 65,
      rainfall: 12,
      condition: "Partly Cloudy",
    });
  });

  app.post("/api/predict", async (req, res) => {
    try {
      const response = await fetch('https://agrotwin-api-vesn3gmkga-uc.a.run.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Proxy Prediction Error:", error);
      res.status(500).json({ error: "Failed to fetch prediction from cloud model" });
    }
  });

  // These will be handled by Gemini on the frontend as per instructions, 
  // but I'll add placeholders if needed for server-side logic.
  // The prompt says "POST /api/explain", "POST /api/recommend"
  // I'll implement them as simple pass-throughs or mock responses if frontend calls them.
  app.post("/api/explain", (req, res) => {
    res.json({ message: "AI Explanation generated" });
  });

  app.post("/api/recommend", (req, res) => {
    res.json({ message: "AI Recommendations generated" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

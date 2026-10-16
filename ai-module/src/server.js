import "dotenv/config";
import express from "express";
import cors from "cors";
import { generatePrompt } from "./generator.js";
import { analyzePrompt } from "./analyzer.js";
import { testPrompt } from "./tester.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const validPrompt = (p) => typeof p === "string" && p.trim().length > 0 && p.length <= 8000;

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.post("/api/generate", async (req, res) => {
  const body = req.body || {};
  if (!body.title?.trim() || !(body.task || body.context)?.trim()) {
    return res.status(400).json({ message: "Title and task are required" });
  }
  try {
    const out = await generatePrompt(body);
    res.json({
      generatedPrompt: out.prompt,
      usage: { tokens: out.tokens, provider: out.provider },
    });
  } catch (err) {
    console.error("[generate]", err);
    res.status(500).json({ message: "Prompt generation failed" });
  }
});

app.post("/api/analyze", async (req, res) => {
  const { prompt } = req.body || {};
  if (!validPrompt(prompt)) {
    return res.status(400).json({ message: "A prompt (up to 8000 characters) is required" });
  }
  try {
    const out = await analyzePrompt(prompt);
    res.json({
      overallScore: out.overallScore,
      scores: out.scores,
      problems: out.problems,
      improvedPrompt: out.improvedPrompt,
      usage: { tokens: out.tokens, provider: out.provider },
    });
  } catch (err) {
    console.error("[analyze]", err);
    res.status(500).json({ message: "Prompt analysis failed" });
  }
});

app.post("/api/test", async (req, res) => {
  const { prompt } = req.body || {};
  if (!validPrompt(prompt)) {
    return res.status(400).json({ message: "A prompt (up to 8000 characters) is required" });
  }
  try {
    const out = await testPrompt(prompt);
    if (!out) {
      return res.status(503).json({
        message: "No AI provider is configured. Add HF_TOKEN or OPENROUTER_API_KEY in ai-module/.env to use the tester.",
      });
    }
    res.json({ reply: out.reply, usage: { tokens: out.tokens, provider: out.provider } });
  } catch (err) {
    console.error("[test]", err);
    res.status(500).json({ message: "Prompt test failed" });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`AI module running on http://localhost:${PORT}`));
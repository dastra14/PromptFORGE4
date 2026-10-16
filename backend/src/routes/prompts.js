import { Router } from "express";
import mongoose from "mongoose";
import Prompt from "../models/Prompt.js";
import auth from "../middleware/auth.js";

const router = Router();
router.use(auth);

const out = (p) => ({
  id: p._id,
  title: p.title,
  category: p.category,
  model: p.model,
  description: p.description,
  text: p.text,
  score: p.score,
  updatedAt: p.updatedAt.getTime(),
});

router.get("/", async (req, res) => {
  const items = await Prompt.find({ user: req.userId }).sort({ updatedAt: -1 }).limit(200);
  res.json({ prompts: items.map(out) });
});

router.post("/", async (req, res) => {
  const { title, category, model, description, text, score } = req.body || {};
  if (!title?.trim() || !text?.trim()) {
    return res.status(400).json({ message: "Title and prompt text are required" });
  }
  try {
    const p = await Prompt.create({
      user: req.userId,
      title,
      category,
      model,
      description,
      text,
      score: Math.max(0, Math.min(100, Number(score) || 0)),
    });
    res.status(201).json({ prompt: out(p) });
  } catch (err) {
    console.error("[save prompt]", err.message);
    res.status(400).json({ message: "Could not save the prompt" });
  }
});

router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid prompt id" });
  }
  const r = await Prompt.deleteOne({ _id: req.params.id, user: req.userId });
  if (!r.deletedCount) return res.status(404).json({ message: "Prompt not found" });
  res.json({ ok: true });
});

router.delete("/", async (req, res) => {
  const r = await Prompt.deleteMany({ user: req.userId });
  res.json({ ok: true, deleted: r.deletedCount });
});

export default router;
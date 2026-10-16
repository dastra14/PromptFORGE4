import { Router } from "express";
import auth from "../middleware/auth.js";
import { charge, refund } from "../middleware/credits.js";

const router = Router();

async function forward(path, body) {
  const r = await fetch(`${process.env.AI_MODULE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data };
}

const route = (action, path) => [
  auth,
  charge(action),
  async (req, res) => {
    try {
      const { ok, status, data } = await forward(path, req.body);
      if (!ok) {
        await refund(req);
        return res.status(status).json({ message: data.message || "AI module error" });
      }
      res.json({ ...data, credits: req.credits });
    } catch (err) {
      await refund(req);
      console.error(`[${action}]`, err.message);
      res.status(502).json({
        message: "AI module is not reachable. Make sure it is running on port 5001.",
      });
    }
  },
];

router.post("/generate", ...route("generate", "/api/generate"));
router.post("/analyze", ...route("analyze", "/api/analyze"));
router.post("/test", ...route("test", "/api/test"));

export default router;
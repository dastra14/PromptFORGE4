// One function for talking to an AI model.
// Order: Hugging Face (Llama) -> OpenRouter -> null (caller uses rule-based fallback)

const HF_URL = "https://router.huggingface.co/v1/chat/completions";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const estimateTokens = (text) => Math.ceil((text || "").length / 4);

async function callChat({ url, key, model, messages, maxTokens, temperature }) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${body}`.slice(0, 300));
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty response from model");
  const inputText = messages.map((m) => m.content).join(" ");
  const tokens = data.usage?.total_tokens ?? estimateTokens(inputText + text);
  return { text, tokens };
}

export async function askLLM({ system, user, maxTokens = 700, temperature = 0.7 }) {
  const messages = [
    { role: "system", content: system },
    { role: "user", content: user },
  ];

  if (process.env.HF_TOKEN) {
    try {
      const r = await callChat({
        url: HF_URL,
        key: process.env.HF_TOKEN,
        model: process.env.HF_MODEL,
        messages, maxTokens, temperature,
      });
      return { ...r, provider: "huggingface" };
    } catch (err) {
      console.warn("[llm] Hugging Face failed:", err.message);
    }
  }

  if (process.env.OPENROUTER_API_KEY) {
    try {
      const r = await callChat({
        url: OPENROUTER_URL,
        key: process.env.OPENROUTER_API_KEY,
        model: process.env.OPENROUTER_MODEL,
        messages, maxTokens, temperature,
      });
      return { ...r, provider: "openrouter" };
    } catch (err) {
      console.warn("[llm] OpenRouter failed:", err.message);
    }
  }

  return null; // no provider available -> caller falls back to rule-based
}
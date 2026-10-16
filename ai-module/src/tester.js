import { askLLM } from "./llm.js";

const SYSTEM = "You are a helpful AI assistant. Respond directly to the user's prompt.";

// Returns null when no AI provider is configured.
export async function testPrompt(prompt) {
  const r = await askLLM({ system: SYSTEM, user: prompt, maxTokens: 700, temperature: 0.7 });
  if (!r) return null;
  return { reply: r.text, tokens: r.tokens, provider: r.provider };
}
import { askLLM, estimateTokens } from "./llm.js";

const SYSTEM = `You are PromptForge, an expert prompt engineer.
Write ONE complete, ready-to-use prompt that the user will paste into the target AI.
The prompt must include: a clear role, the task, relevant context, constraints, and the expected output format.
Match the requested tone and optimize for the target AI.
Output ONLY the prompt text. No explanations, no headings like "Here is your prompt", no surrounding quotes.`;

const TARGET_HINTS = {
  Midjourney: "Describe subject, style, lighting, composition and camera details as a rich visual description.",
  "Stable Diffusion": "Describe subject, style, lighting and quality keywords, plus a short negative-prompt line.",
  CodeLlama: "Be precise about language, inputs, outputs and edge cases.",
};

function templatePrompt({ title, task, context, moreInfo, tone, targetAI }) {
  const lines = [
    `Act as an expert assistant specialized in: ${title}.`,
    "",
    `Task: ${task}`,
  ];
  if (context?.trim()) lines.push("", `Context: ${context.trim()}`);
  lines.push(
    "",
    "Requirements:",
    `- Use a ${tone.toLowerCase()} tone.`,
    "- Be specific and avoid vague or generic statements.",
    "- If any detail is missing, state your assumption instead of guessing silently."
  );
  if (moreInfo?.trim()) lines.push(`- ${moreInfo.trim()}`);
  if (TARGET_HINTS[targetAI]) lines.push(`- ${TARGET_HINTS[targetAI]}`);
  lines.push("", "Output format: Give a clear, well-structured answer with short sections or bullet points.");
  return lines.join("\n");
}

export async function generatePrompt(input) {
  const data = {
    title: input.title?.trim() || "General assistant",
    task: (input.task || input.context || "").trim(),
    context: input.task ? input.context || "" : "",
    moreInfo: input.moreInfo || "",
    tone: input.tone || "Professional",
    targetAI: input.targetAI || "ChatGPT",
  };

  const user = [
    `Title: ${data.title}`,
    `What the AI should do: ${data.task}`,
    data.context && `Context: ${data.context}`,
    data.moreInfo && `Output format and constraints: ${data.moreInfo}`,
    `Tone: ${data.tone}`,
    `Target AI: ${data.targetAI}`,
  ].filter(Boolean).join("\n");

  const result = await askLLM({ system: SYSTEM, user, maxTokens: 700, temperature: 0.7 });
  if (result) return { prompt: result.text, tokens: result.tokens, provider: result.provider };

  const prompt = templatePrompt(data);
  return { prompt, tokens: estimateTokens(user + prompt), provider: "rule-based" };
}
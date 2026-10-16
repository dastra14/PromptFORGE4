import { askLLM, estimateTokens } from "./llm.js";

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

const RE = {
  role: /\b(act as|you are|as an?|take the role|pretend)\b/i,
  task: /\b(create|write|generate|explain|review|summari[sz]e|analy[sz]e|list|design|build|compare|translate|describe|draft|plan|solve|debug|fix|suggest|give|make|develop|find|identify)\b/i,
  constraints: /\b(must|should|avoid|do not|don't|never|only|limit|at most|at least|maximum|minimum|no more than|under \d+|within \d+)\b/i,
  format: /\b(format|table|bullet|list|json|steps?|sections?|paragraphs?|markdown|outline|headings?|words|sentences|output|return|respond)\b/i,
  context: /\b(context|background|audience|for (a|an|my|the)|because|currently|situation|goal|purpose|so that|who)\b/i,
};
const VAGUE = /\b(something|stuff|things?|whatever|good|nice|etc|anything|some)\b/gi;

export function ruleAnalyze(prompt) {
  const text = prompt.trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  const lines = text.split("\n").filter((l) => l.trim()).length;

  const hasRole = RE.role.test(text);
  const hasTask = RE.task.test(text);
  const hasContext = RE.context.test(text);
  const hasConstraints = RE.constraints.test(text);
  const hasFormat = RE.format.test(text);
  const hasNumbers = /\d/.test(text);
  const hasBullets = /^\s*([-*•]|\d+[.)])\s/m.test(text);
  const hasLabels = /^[A-Z][A-Za-z &]{2,25}:/m.test(text);
  const vagueWords = [...new Set((text.match(VAGUE) || []).map((w) => w.toLowerCase()))];
  const vagueCount = (text.match(VAGUE) || []).length;

  const scores = {
    clarity: clamp(
      40 + (hasTask ? 20 : -10) + (words >= 12 && words <= 400 ? 15 : 0) +
      (hasRole ? 15 : 0) + (lines > 1 ? 5 : 0) - vagueCount * 8 - (words < 6 ? 25 : 0)
    ),
    context: clamp(25 + (hasContext ? 30 : 0) + Math.min(words, 80) * 0.5),
    specificity: clamp(
      30 + (hasConstraints ? 25 : 0) + (hasNumbers ? 15 : 0) + Math.min(words, 100) * 0.3 - vagueCount * 8
    ),
    structure: clamp(
      30 + (lines >= 3 ? 25 : 0) + (hasBullets ? 20 : 0) + (hasLabels ? 20 : 0) + (hasRole ? 5 : 0)
    ),
    expectedOutput: clamp(
      20 + (hasFormat ? 45 : 0) + (hasConstraints ? 10 : 0) + (words >= 25 ? 10 : 0)
    ),
  };

  const overallScore = clamp(
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
  );

  const problems = [];
  if (words < 8) problems.push("The prompt is very short, so the AI has to guess what you want. Add detail.");
  if (!hasRole) problems.push("No role is assigned. Start with something like \"Act as an expert in ...\".");
  if (!hasTask) problems.push("No clear task verb found. Say exactly what the AI should do (create, review, explain...).");
  if (!hasContext) problems.push("Context is missing. Say who the answer is for and what the situation is.");
  if (!hasConstraints) problems.push("No constraints given. Add limits such as length, tone, or things to avoid.");
  if (!hasFormat) problems.push("Expected output format is not defined. Ask for a table, bullet list, steps, etc.");
  if (vagueWords.length) problems.push(`Vague words found (${vagueWords.join(", ")}). Replace them with specifics.`);
  if (words > 40 && lines < 3 && !hasBullets) problems.push("Long prompt with no structure. Split it into labelled sections or bullets.");

  return { overallScore, scores, problems, flags: { hasRole, hasContext, hasFormat }, text };
}

function ruleImprove({ text, flags }) {
  const structured = /^\s*(task|requirements|output format)\s*:/im.test(text);
  const out = [];

  if (!flags.hasRole) out.push("Act as an expert assistant in this topic.", "");
  out.push(structured ? text.trim() : `Task: ${text.trim()}`);

  const extra = [];
  if (!structured) extra.push("Be specific and avoid vague statements.");
  if (!flags.hasContext) {
    extra.push("State your assumptions about the audience and situation before answering.");
  }
  if (extra.length) out.push("", "Additional requirements:", ...extra.map((e) => `- ${e}`));

  if (!flags.hasFormat) {
    out.push("", "Output format: Give a clear, well-structured answer with short sections or bullet points.");
  }
  return out.join("\n");
}

const IMPROVE_SYSTEM = `You are an expert prompt engineer.
Rewrite the user's prompt so it is clearer and more effective: add a role, context, constraints and an output format where they are missing.
Keep the original intent. Do not invent facts or details the user did not give.
Output ONLY the improved prompt text, nothing else.`;

export async function analyzePrompt(prompt) {
  const base = ruleAnalyze(prompt);
  const hints = base.problems.length ? `Problems found:\n- ${base.problems.join("\n- ")}\n\n` : "";

  let improvedPrompt = ruleImprove(base);
  let tokens = estimateTokens(prompt);
  let provider = "rule-based";

  const ai = await askLLM({
    system: IMPROVE_SYSTEM,
    user: `${hints}Prompt to improve:\n${prompt}`,
    maxTokens: 600,
    temperature: 0.5,
  });
  if (ai) {
    improvedPrompt = ai.text;
    tokens = ai.tokens;
    provider = ai.provider;
  }

  return {
    overallScore: base.overallScore,
    scores: base.scores,
    problems: base.problems,
    improvedPrompt,
    tokens,
    provider,
  };
}
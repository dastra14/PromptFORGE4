import { useState } from "react";
import { Sparkles, RotateCcw, Bot, Copy, FlaskConical, Search, Bookmark } from "lucide-react";
import { generatePrompt, analyzePrompt, testPrompt } from "../api/aiApi.js";
import { toPercent } from "../utils/helpers.js";
import { createPrompt } from "../api/promptsApi.js";
import { useCredits } from "../context/CreditsContext.jsx";
import CreditNote from "../components/CreditNote.jsx";
import AnalysisCard from "../components/AnalysisCard.jsx";

const EMPTY = { title: "", task: "", context: "", moreInfo: "", tone: "Professional", targetAI: "ChatGPT" };
const TONES = ["Professional", "Creative", "Academic", "Artistic", "Friendly"];
const TARGETS = ["ChatGPT", "Claude", "Gemini", "Midjourney", "Stable Diffusion", "CodeLlama"];

const TEMPLATES = {
  "Technical Code Auditor": {
    title: "Technical Code Auditor",
    task: "Act as a senior software engineer and review the code I provide for bugs, security issues and performance problems.",
    context: "The code belongs to a production web application written in Python and JavaScript.",
    moreInfo: "Return findings as a prioritized list, each with a short fix.",
    tone: "Professional", targetAI: "ChatGPT",
  },
  "Academic Literature Synthesizer": {
    title: "Academic Literature Synthesizer",
    task: "Act as a research assistant and synthesize the key findings of several academic papers on one topic.",
    context: "The reader is an undergraduate student writing a literature review.",
    moreInfo: "Use simple language, group findings by theme and end with research gaps.",
    tone: "Academic", targetAI: "Claude",
  },
};

export default function CreatePrompt() {
  const [form, setForm] = useState(EMPTY);
  const [generated, setGenerated] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [testReply, setTestReply] = useState("");
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const { withCredits } = useCredits();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const run = async (name, fn) => {
    setError("");
    setLoading(name);
    try {
      await fn();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading("");
    }
  };

  const reset = () => {
    setForm(EMPTY); setGenerated(""); setAnalysis(null); setTestReply(""); setError(""); setSaved(false);
  };

  const handleGenerate = () =>
    run("generate", async () => {
      setAnalysis(null); setTestReply(""); setSaved(false);
      setGenerated(await withCredits("generate", () => generatePrompt(form)));
    });

  const handleAnalyze = () =>
    run("analyze", async () =>
      setAnalysis(await withCredits("analyze", () => analyzePrompt(generated)))
    );

  const handleTest = () =>
    run("test", async () =>
      setTestReply(await withCredits("test", () => testPrompt(generated)))
    );

  const handleSave = () =>
  run("save", async () => {
    await createPrompt({
      category: form.tone,
      model: form.targetAI,
      title: form.title,
      description: form.task.slice(0, 110),
      text: generated,
      score: toPercent(analysis.overallScore),
    });
    setSaved(true);
  });

  return (
    <div className="space-y-6">
      <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Sparkles size={18} className="text-indigo-400" /> Quick Start Templates
            <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-xs text-indigo-300">PRE-CONFIGURED</span>
          </h2>
          <p className="mt-1 text-slate-400">Load a pre-configured sample to test the creation engine immediately.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {Object.keys(TEMPLATES).map((name) => (
            <button key={name} className="btn-ghost" onClick={() => { setForm(TEMPLATES[name]); setGenerated(""); setAnalysis(null); }}>
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: form */}
        <div className="card space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Prompt Specifications</h2>
              <p className="text-slate-400">Define context, objectives, and model criteria</p>
            </div>
            <button className="btn-ghost" onClick={reset}><RotateCcw size={14} /> Reset</button>
          </div>
          <div>
            <label className="label">Prompt Title <span className="text-red-400">*</span></label>
            <input className="field" name="title" value={form.title} onChange={onChange}
              placeholder="e.g. Generate Study Plan or Python Code Reviewer" />
          </div>
          <div>
            <label className="label">What do you want the AI to do? <span className="text-red-400">*</span></label>
            <textarea className="field" rows={4} name="task" value={form.task} onChange={onChange}
              placeholder="State the core task clearly (e.g. Act as a senior database administrator and diagnose slow SQL queries...)" />
          </div>
          <div>
            <label className="label">Context &amp; Background Information</label>
            <textarea className="field" rows={3} name="context" value={form.context} onChange={onChange}
              placeholder="Who is it for? What is the situation?" />
          </div>
          <div>
            <label className="label">Output format &amp; constraints</label>
            <textarea className="field" rows={2} name="moreInfo" value={form.moreInfo} onChange={onChange}
              placeholder="e.g. Return a table, keep it under 200 words, avoid jargon" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tone</label>
              <select className="field" name="tone" value={form.tone} onChange={onChange}>
                {TONES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Target AI</label>
              <select className="field" name="targetAI" value={form.targetAI} onChange={onChange}>
                {TARGETS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <button className="btn-primary w-full py-3" onClick={handleGenerate}
            disabled={!form.title || !form.task || !!loading}>
            <Sparkles size={18} /> {loading === "generate" ? "Generating..." : "Generate Prompt"}
          </button>
          <CreditNote action="generate" />
        </div>

        {/* Right: result */}
        <div className="space-y-6">
          {error && <p className="rounded-xl bg-red-500/10 p-4 text-red-400">{error}</p>}

          {!generated ? (
            <div className="card flex flex-col items-center p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-panel2 text-indigo-400">
                <Bot size={26} />
              </div>
              <h2 className="mt-4 text-xl font-bold text-white">Ready to Generate</h2>
              <p className="mt-2 text-slate-400">
                Fill out the parameters on the left or select a template to build a structured, high-quality prompt.
              </p>
              <div className="mt-6 w-full rounded-xl border border-line bg-panel2 p-5 text-left">
                <h3 className="text-xs font-semibold tracking-wider text-white">PROMPTFORGE ENGINEERING PRINCIPLES</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-400">
                  <li>• Explicit role assignment improves AI domain consistency.</li>
                  <li>• Constraining output format eliminates hallucinations.</li>
                  <li>• Providing negative constraints avoids common failure modes.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="card space-y-4">
              <h2 className="text-xl font-bold text-white">Generated Prompt</h2>
              <textarea className="field font-mono text-sm" rows={10} value={generated}
                onChange={(e) => setGenerated(e.target.value)} />
              <div className="flex flex-wrap gap-3">
                <button className="btn-primary" onClick={handleAnalyze} disabled={!!loading}>
                  <Search size={16} /> {loading === "analyze" ? "Analyzing..." : "Analyze"}
                </button>
                <button className="btn-ghost" onClick={handleTest} disabled={!!loading}>
                  <FlaskConical size={16} /> {loading === "test" ? "Testing..." : "Test Prompt"}
                </button>
                <button className="btn-ghost" onClick={() => navigator.clipboard.writeText(generated)}>
                  <Copy size={16} /> Copy
                </button>
                <button className="btn-ghost" onClick={handleSave} disabled={!analysis || saved}
                  title={analysis ? "" : "Analyze first to save with a score"}>
                  <Bookmark size={16} /> {saved ? "Saved ✓" : "Save"}
                </button>
              </div>
            </div>
          )}

          {analysis && <AnalysisCard analysis={analysis} onUse={setGenerated} />}

          {testReply && (
            <div className="card">
              <h2 className="mb-2 text-xl font-bold text-white">AI Reply</h2>
              <p className="whitespace-pre-wrap text-slate-300">{testReply}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
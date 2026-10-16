import { toPercent, scoreTone } from "../utils/helpers.js";

const problemText = (p) =>
  typeof p === "string" ? p : p.message || p.issue || p.description || JSON.stringify(p);

export default function AnalysisCard({ analysis, onUse }) {
  const score = toPercent(analysis.overallScore);
  const subs = Object.entries(analysis.scores || {}).filter(([, v]) => typeof v === "number");
  const problems = analysis.problems || [];

  return (
    <div className="card space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Analysis Result</h2>
        <span className={`rounded-lg border px-3 py-1 text-lg font-bold ${scoreTone(score)}`}>
          {score}<span className="text-sm opacity-70">/100</span>
        </span>
      </div>

      {subs.length > 0 && (
        <div className="space-y-3">
          {subs.map(([k, v]) => (
            <div key={k}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="capitalize text-slate-300">{k}</span>
                <span className="text-slate-400">{toPercent(v)}%</span>
              </div>
              <div className="h-2 rounded-full bg-panel2">
                <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${toPercent(v)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h3 className="mb-2 font-medium text-white">Problems found</h3>
        {problems.length ? (
          <ul className="list-disc space-y-1 pl-5 text-red-300">
            {problems.map((p, i) => <li key={i}>{problemText(p)}</li>)}
          </ul>
        ) : (
          <p className="text-emerald-400">No problems found.</p>
        )}
      </div>

      {analysis.improvedPrompt && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-medium text-white">Improved prompt</h3>
            {onUse && (
              <button className="btn-ghost" onClick={() => onUse(analysis.improvedPrompt)}>Use this</button>
            )}
          </div>
          <p className="whitespace-pre-wrap rounded-xl border border-line bg-panel2 p-4 text-slate-300">
            {analysis.improvedPrompt}
          </p>
        </div>
      )}
    </div>
  );
}
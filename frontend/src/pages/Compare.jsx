import { useState } from "react";
import { GitCompare } from "lucide-react";
import { analyzePrompt } from "../api/aiApi.js";
import { toPercent } from "../utils/helpers.js";
import { useCredits } from "../context/CreditsContext.jsx";
import CreditNote from "../components/CreditNote.jsx";
import AnalysisCard from "../components/AnalysisCard.jsx";

export default function Compare() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { withCredits, costs } = useCredits();

  const compare = async () => {
    setError(""); setLoading(true);
    try {
      const [ra, rb] = await withCredits(
        "analyze",
        () => Promise.all([analyzePrompt(a), analyzePrompt(b)]),
        2
      );
      setRes({ a: ra, b: rb });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const sa = res ? toPercent(res.a.overallScore) : 0;
  const sb = res ? toPercent(res.b.overallScore) : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {[["Prompt A", a, setA], ["Prompt B", b, setB]].map(([label, val, set]) => (
          <div key={label} className="card space-y-3">
            <h2 className="text-xl font-bold text-white">{label}</h2>
            <textarea className="field font-mono text-sm" rows={10} value={val}
              onChange={(e) => set(e.target.value)} placeholder={`Paste ${label} here...`} />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <button className="btn-primary px-6 py-3" onClick={compare}
          disabled={!a.trim() || !b.trim() || loading}>
          <GitCompare size={18} /> {loading ? "Comparing..." : `Compare Prompts · ${costs.analyze * 2}`}
        </button>
        <div className="max-w-md">
          <CreditNote action="analyze" count={2} />
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-500/10 p-4 text-red-400">{error}</p>}

      {res && (
        <>
          <div className="card text-center text-lg text-white">
            {sa === sb ? "Both prompts scored the same." : `Prompt ${sa > sb ? "A" : "B"} wins by ${Math.abs(sa - sb)} points.`}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <AnalysisCard analysis={res.a} />
            <AnalysisCard analysis={res.b} />
          </div>
        </>
      )}
    </div>
  );
}
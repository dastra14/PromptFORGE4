import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Trash2, Clock } from "lucide-react";
import { getPrompts, deletePrompt, scoreTone, timeAgo } from "../utils/helpers.js";

export default function SavedPrompts() {
  const navigate = useNavigate();
  const [items, setItems] = useState(getPrompts());
  const [q, setQ] = useState("");

  const shown = items.filter((p) => (p.title + p.description).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <input className="field max-w-md" placeholder="Search saved prompts..." value={q}
        onChange={(e) => setQ(e.target.value)} />

      {shown.length === 0 && <p className="text-slate-400">No saved prompts found.</p>}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((p) => (
          <div key={p.id} className="card flex flex-col p-5">
            <div className="flex items-center justify-between">
              <span className="rounded-lg border border-line bg-panel2 px-2 py-1 text-xs">{p.category}</span>
              <span className={`rounded-lg border px-2 py-1 text-sm font-semibold ${scoreTone(p.score)}`}>{p.score}/100</span>
            </div>
            <h3 className="mt-4 text-xl font-bold text-white">{p.title}</h3>
            <p className="mt-2 flex-1 text-slate-400">{p.description}</p>
            <div className="mt-5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                <Clock size={14} /> {timeAgo(p.updatedAt)}
              </span>
              <div className="flex gap-2">
                <button className="btn-ghost" onClick={() => setItems(deletePrompt(p.id))}><Trash2 size={14} /></button>
                <button className="btn-ghost"
                  onClick={() => navigate("/analyze", { state: { prompt: p.text || p.description } })}>
                  Open <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
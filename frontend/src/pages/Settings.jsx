import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { clearAllPrompts } from "../api/promptsApi.js";

export default function Settings() {
  const { user } = useAuth();
  const [msg, setMsg] = useState("");

  const clear = async () => {
    if (!confirm("Delete all your saved prompts? This cannot be undone.")) return;
    try {
      await clearAllPrompts();
      setMsg("All saved prompts were deleted.");
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="card space-y-3">
        <h2 className="text-xl font-bold text-white">Account</h2>
        <p className="text-slate-400">Name: <span className="text-white">{user?.name}</span></p>
        <p className="text-slate-400">Email: <span className="text-white">{user?.email}</span></p>
      </div>
      <div className="card space-y-3">
        <h2 className="text-xl font-bold text-white">Data</h2>
        <p className="text-slate-400">Remove all your saved prompts.</p>
        <button className="btn-ghost" onClick={clear}>Clear saved prompts</button>
        {msg && <p className="text-sm text-emerald-400">{msg}</p>}
      </div>
    </div>
  );
}
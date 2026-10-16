import { Link } from "react-router-dom";
import { Terminal } from "lucide-react";

export default function AuthShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-panel text-indigo-400">
        <Terminal size={28} />
      </div>
      <h1 className="text-4xl font-bold text-white">PromptForge</h1>
      <p className="mt-2 max-w-sm text-center text-slate-400">
        AI Prompt Engineering and Management Platform
      </p>
      <div className="card mt-8 w-full max-w-md p-8">{children}</div>
      <Link to="/" className="mt-6 text-sm text-slate-500 hover:text-slate-300">← Back to home</Link>
    </div>
  );
}
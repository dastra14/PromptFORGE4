import { Outlet, useLocation, Link } from "react-router-dom";
import { Bell, Plus , Zap} from "lucide-react";
import Sidebar from "./Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCredits } from "../context/CreditsContext.jsx";

const TITLES = {
  "/dashboard": ["Dashboard", "Create, analyze and manage your AI prompts in one place."],
  "/create-prompt": ["Create Prompt", "Design, structure, and generate high-performance prompts with guided parameters."],
  "/analyze": ["Analyze Prompt", "Evaluate prompt clarity, context, specificity, and output predictability against benchmarks."],
  "/compare": ["Compare Prompts", "Evaluate two prompts side by side and see which one scores higher."],
  "/saved": ["Saved Prompts", "Your saved and reusable prompts."],
  "/settings": ["Settings", "Manage your account and app data."],
};

export default function AppLayout() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { balance } = useCredits();
  const [title, sub] = TITLES[pathname] || TITLES["/dashboard"];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            <p className="mt-1 max-w-2xl text-slate-400">{sub}</p>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 font-semibold text-indigo-200">
  <Zap size={16} /> {balance} credits
</div>
            <button className="relative text-slate-300 hover:text-white">
              <Bell size={20} />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-indigo-500" />
            </button>
            <div className="flex items-center gap-2 text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-bold">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </span>
              <span className="hidden font-medium sm:inline">{user?.name}</span>
            </div>
            <Link to="/create-prompt" className="btn-primary"><Plus size={18} /> Create Prompt</Link>
          </div>
        </header>
        <main className="p-8"><Outlet /></main>
      </div>
    </div>
  );
}
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Sparkles, Search, GitCompare, Bookmark, Settings, Terminal, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const WORKSPACE = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/create-prompt", label: "Create Prompt", icon: Sparkles },
  { to: "/analyze", label: "Analyzer", icon: Search },
  { to: "/compare", label: "Compare", icon: GitCompare },
  { to: "/saved", label: "Saved Prompts", icon: Bookmark },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl border px-4 py-3 font-medium transition ${
    isActive
      ? "border-indigo-500/60 bg-indigo-500/10 text-white"
      : "border-transparent text-slate-400 hover:bg-panel hover:text-white"
  }`;

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-line bg-bg lg:flex">
      <div className="flex items-center gap-3 border-b border-line p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-panel text-indigo-400">
          <Terminal size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            PromptForge
            <span className="rounded-md border border-indigo-500/40 bg-indigo-500/10 px-1.5 py-0.5 text-[10px] text-indigo-300">V0.1</span>
          </div>
          <div className="text-sm text-slate-400">AI Prompt Studio</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        <p className="px-2 pb-2 pt-2 text-xs font-semibold tracking-wider text-slate-500">WORKSPACE</p>
        {WORKSPACE.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <Icon size={18} /> {label}
          </NavLink>
        ))}
        <p className="px-2 pb-2 pt-6 text-xs font-semibold tracking-wider text-slate-500">PREFERENCES</p>
        <NavLink to="/settings" className={linkClass}>
          <Settings size={18} /> Settings
        </NavLink>
      </nav>

      <div className="m-4 flex items-center gap-3 rounded-xl border border-line bg-panel p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-bold text-white">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-white">{user?.name}</div>
          <div className="text-sm text-slate-400">Student</div>
        </div>
        <button onClick={() => { logout(); navigate("/"); }} title="Logout" className="text-slate-400 hover:text-white">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
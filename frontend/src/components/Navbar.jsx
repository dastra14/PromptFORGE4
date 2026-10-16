import { Link, useNavigate } from "react-router-dom";
import { Terminal } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-panel text-indigo-400">
            <Terminal size={18} />
          </span>
          PromptForge
        </Link>
        <div className="hidden gap-6 text-slate-400 md:flex">
          <a href="/#about" className="hover:text-white">About</a>
          <a href="/#features" className="hover:text-white">Features</a>
          <a href="/#how" className="hover:text-white">How it works</a>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard" className="btn-primary">Dashboard</Link>
              <button onClick={() => { logout(); navigate("/"); }} className="btn-ghost">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-medium text-slate-300 hover:text-white">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
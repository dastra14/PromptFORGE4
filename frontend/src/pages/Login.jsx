import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-white">Welcome back</h2>
          <p className="mt-1 text-slate-400">Sign in to manage and evaluate your prompts</p>
        </div>
        {error && <p className="rounded-xl bg-red-500/10 p-3 text-red-400">{error}</p>}
        <div>
          <label className="label">Email</label>
          <input className="field" type="email" name="email" placeholder="Enter your email"
            value={form.email} onChange={onChange} required />
        </div>
        <div>
          <div className="flex justify-between">
            <label className="label">Password</label>
            <button type="button" className="text-sm text-indigo-400">Forgot password?</button>
          </div>
          <div className="relative">
            <input className="field pr-12" type={show ? "text" : "password"} name="password"
              placeholder="Enter your password" value={form.password} onChange={onChange} required />
            <button type="button" onClick={() => setShow(!show)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <label className="flex items-center gap-2 text-slate-300">
          <input type="checkbox" defaultChecked className="accent-indigo-500" /> Remember me
        </label>
        <button className="btn-primary w-full py-3" disabled={loading}>
          {loading ? "Logging in..." : "Login"} <ArrowRight size={18} />
        </button>
        <p className="border-t border-line pt-4 text-center text-slate-400">
          New here? <Link to="/register" className="font-medium text-indigo-400">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}
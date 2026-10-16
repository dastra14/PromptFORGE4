import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    if (form.password !== form.confirm) return setError("Passwords do not match");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
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
          <h2 className="text-2xl font-bold text-white">Create your account</h2>
          <p className="mt-1 text-slate-400">Start building better prompts today</p>
        </div>
        {error && <p className="rounded-xl bg-red-500/10 p-3 text-red-400">{error}</p>}
        <div><label className="label">Full name</label>
          <input className="field" name="name" placeholder="Enter your name" value={form.name} onChange={onChange} required /></div>
        <div><label className="label">Email</label>
          <input className="field" type="email" name="email" placeholder="Enter your email" value={form.email} onChange={onChange} required /></div>
        <div><label className="label">Password</label>
          <input className="field" type="password" name="password" placeholder="At least 6 characters" value={form.password} onChange={onChange} required /></div>
        <div><label className="label">Confirm password</label>
          <input className="field" type="password" name="confirm" placeholder="Repeat your password" value={form.confirm} onChange={onChange} required /></div>
        <button className="btn-primary w-full py-3" disabled={loading}>
          {loading ? "Creating account..." : "Register"} <ArrowRight size={18} />
        </button>
        <p className="border-t border-line pt-4 text-center text-slate-400">
          Already have an account? <Link to="/login" className="font-medium text-indigo-400">Login</Link>
        </p>
      </form>
    </AuthShell>
  );
}
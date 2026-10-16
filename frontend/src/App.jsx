import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppLayout from "./components/AppLayout.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreatePrompt from "./pages/CreatePrompt.jsx";
import Analyzer from "./pages/Analyzer.jsx";
import Compare from "./pages/Compare.jsx";
import SavedPrompts from "./pages/SavedPrompts.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-prompt" element={<CreatePrompt />} />
        <Route path="/analyze" element={<Analyzer />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/saved" element={<SavedPrompts />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
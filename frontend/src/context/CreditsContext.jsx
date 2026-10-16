import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { setCreditsListener } from "../api/aiApi.js";
import { useAuth } from "./AuthContext.jsx";

const CreditsContext = createContext(null);
export const useCredits = () => useContext(CreditsContext);

// Keep in sync with COSTS in backend/src/middleware/credits.js
export const COSTS = { generate: 5, analyze: 2, test: 3 };

export function CreditsProvider({ children }) {
  const { user } = useAuth();
  const token = user?.token;
  const [balance, setBalance] = useState(0);
  const [lastUsed, setLastUsed] = useState(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBalance(data.user.credits);
    } catch {
      /* keep the last known balance */
    }
  }, [token]);

  useEffect(() => {
    setLastUsed(null);
    if (!token) setBalance(0);
    else refresh();
  }, [token, refresh]);

  // Instant update from each AI response; refresh() then confirms the real value
  useEffect(() => {
    setCreditsListener((c) => {
      if (typeof c?.remaining === "number") setBalance(c.remaining);
    });
    return () => setCreditsListener(null);
  }, []);

  const withCredits = async (action, fn, count = 1) => {
    const cost = COSTS[action] * count;
    if (balance < cost) {
      throw new Error(`Not enough credits. This needs ${cost}, you have ${balance}.`);
    }
    const result = await fn();
    setLastUsed(cost);
    await refresh();
    return result;
  };

  return (
    <CreditsContext.Provider value={{ balance, lastUsed, costs: COSTS, withCredits, refresh }}>
      {children}
    </CreditsContext.Provider>
  );
}
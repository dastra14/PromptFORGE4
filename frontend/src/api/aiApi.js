import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

let creditsListener = null;
export const setCreditsListener = (fn) => {
  creditsListener = fn;
};

// Send the login token with every request
api.interceptors.request.use((config) => {
  try {
    const u = JSON.parse(localStorage.getItem("pf_user"));
    if (u?.token) config.headers.Authorization = `Bearer ${u.token}`;
  } catch {
    /* ignore */
  }
  return config;
});

// Any response with { credits: { used, remaining } } updates the UI
api.interceptors.response.use((res) => {
  if (res.data?.credits && creditsListener) creditsListener(res.data.credits);
  return res;
});

export const generatePrompt = async (form) => {
  const { data } = await api.post("/api/generate", form);
  return data.generatedPrompt || data.prompt || data.improvedPrompt || "";
};

export const analyzePrompt = async (prompt) => {
  const { data } = await api.post("/api/analyze", { prompt });
  return data;
};

export const testPrompt = async (prompt) => {
  const { data } = await api.post("/api/test", { prompt });
  return data.reply || data.output || data.response || JSON.stringify(data);
};
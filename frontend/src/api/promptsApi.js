import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_BACKEND_URL });

api.interceptors.request.use((config) => {
  try {
    const u = JSON.parse(localStorage.getItem("pf_user"));
    if (u?.token) config.headers.Authorization = `Bearer ${u.token}`;
  } catch {
    /* ignore */
  }
  return config;
});

const fail = (err) => {
  throw new Error(err.response?.data?.message || err.message || "Request failed");
};

export const listPrompts = () =>
  api.get("/api/prompts").then((r) => r.data.prompts).catch(fail);

export const createPrompt = (p) =>
  api.post("/api/prompts", p).then((r) => r.data.prompt).catch(fail);

export const removePrompt = (id) =>
  api.delete(`/api/prompts/${id}`).catch(fail);

export const clearAllPrompts = () =>
  api.delete("/api/prompts").catch(fail);
import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_BACKEND_URL });
const NO_SERVER = "Cannot reach the server. Make sure the backend is running.";

async function call(path, body, fallbackMessage) {
  try {
    const { data } = await api.post(path, body);
    return {
      name: data.user.name,
      email: data.user.email,
      token: data.token,
      credits: data.user.credits,
    };
  } catch (err) {
    throw new Error(err.response ? err.response.data?.message || fallbackMessage : NO_SERVER);
  }
}

export const registerUser = (name, email, password) =>
  call("/api/auth/register", { name, email, password }, "Registration failed");

export const loginUser = (email, password) =>
  call("/api/auth/login", { email, password }, "Login failed");
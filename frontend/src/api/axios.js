import axios from "axios";

// A single shared axios instance for the whole app.
// The request interceptor automatically attaches the JWT (if we have one)
// so individual pages/components never have to manage auth headers.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend ever says our token is invalid/expired, log the user out
// client-side so they aren't stuck on a broken page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from "axios";

/* =========================
   AXIOS INSTANCE
========================= */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

/* =========================
   GLOBAL RESPONSE HANDLER
========================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API ERROR:", error.response?.data || error.message);

    // 🔥 Optional: auto logout on 401
    if (error.response?.status === 401) {
      console.warn("Unauthorized - redirect to login if needed");
    }

    return Promise.reject(error);
  }
);

/* =========================
   REGISTER
========================= */
export const register = async ({ username, email, password }) => {
  const res = await api.post("/auth/register", {
    username,
    email,
    password,
  });

  return res.data;
};

/* =========================
   LOGIN
========================= */
export const login = async ({ email, password }) => {
  const res = await api.post("/auth/login", {
    email,
    password,
  });

  return res.data;
};

/* =========================
   LOGOUT
========================= */
export const logout = async () => {
  const res = await api.get("/auth/logout");
  return res.data;
};

/* =========================
   GET ME
========================= */
export const getMe = async () => {
  const res = await api.get("/auth/get-me");
  return res.data;
};

/* =========================
   EXPORT API INSTANCE (REUSE)
========================= */
export default api;
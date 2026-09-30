import axios from "axios";

// One shared Axios instance for the whole app.
// baseURL "/api" is forwarded to Express by the Vite proxy.
// In Phase 4 we will add the JWT token to every request here.
const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export default api;
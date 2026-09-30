import api from "./api";

export const login = async (userId, password) => {
  const res = await api.post("/auth/login", { userId, password });
  return res.data; // { success, token, user }
};

export const getMe = async () => {
  const res = await api.get("/auth/me");
  return res.data; // { success, user }
};
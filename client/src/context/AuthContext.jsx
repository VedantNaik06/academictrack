import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContextObject.js";
import * as authService from "../services/authService";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Start as "loading" only if a saved token exists and must be checked.
  // This avoids calling setLoading synchronously inside the effect.
  const [loading, setLoading] = useState(() =>
    Boolean(localStorage.getItem("token"))
  );

  // On page load/refresh: if a token is saved, ask the server who we are
  useEffect(() => {
    if (!localStorage.getItem("token")) return;

    authService
      .getMe()
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (userId, password) => {
    const data = await authService.login(userId, password);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
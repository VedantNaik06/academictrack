import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { ROLE_HOME } from "../utils/roles";

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ userId: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already logged in -> skip the login page
  if (user) {
    return <Navigate to={ROLE_HOME[user.role]} replace />;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Client-side validation (the server validates again: never trust only this)
  const validate = () => {
    const newErrors = {};
    if (!form.userId.trim()) newErrors.userId = "User ID is required";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setSubmitting(true);
      const loggedInUser = await login(form.userId.trim(), form.password);
      navigate(ROLE_HOME[loggedInUser.role], { replace: true });
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-800 text-center">
          AcademicTrack
        </h1>
        <p className="text-slate-500 text-center mb-6">
          Sign in with your ID and password
        </p>

        {serverError && (
          <p className="rounded bg-red-100 text-red-700 p-3 mb-4 text-sm">
            {serverError}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            User ID
          </label>
          <input
            type="text"
            name="userId"
            value={form.userId}
            onChange={handleChange}
            placeholder="e.g. CSE-FAC-001"
            className="w-full border border-slate-300 rounded px-3 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.userId && (
            <p className="text-red-600 text-sm mb-2">{errors.userId}</p>
          )}

          <label className="block text-sm font-medium text-slate-700 mb-1 mt-3">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded px-3 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.password && (
            <p className="text-red-600 text-sm mb-2">{errors.password}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-5 bg-blue-600 text-white rounded py-2 font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
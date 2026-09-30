import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Alert from "../components/Alert";
import { ROLE_HOME } from "../utils/roles";

const FEATURES = [
  "Digital syllabus and lecture-wise planning",
  "Daily teaching reports in under a minute",
  "Automatic progress for every unit and subject",
  "One live dashboard for the HOD",
];

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ userId: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel: desktop only */}
      <div
        className="hidden flex-col justify-between p-12 text-white lg:flex"
        style={{ backgroundImage: "linear-gradient(135deg, #4338ca, #1e1b4b)" }}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 text-xl font-bold">
            A
          </span>
          <span className="text-xl font-semibold">AcademicTrack</span>
        </div>

        <div>
          <h2 className="text-4xl font-bold leading-tight">
            Plan it. Teach it.
            <br />
            Track it automatically.
          </h2>
          <p className="mt-4 max-w-md text-indigo-100">
            A centralized academic planning and teaching progress management
            system for departments, faculty and HODs.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-indigo-50">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-300" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-indigo-200">College Project | MERN Stack</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Small logo for phones */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-xl font-bold text-white">
              A
            </span>
            <span className="text-xl font-semibold text-slate-900">
              AcademicTrack
            </span>
          </div>

          <div className="card p-6 sm:p-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Sign in
            </h1>
            <p className="mb-6 mt-1 text-sm text-slate-500">
              Enter your ID and password to continue.
            </p>

            <Alert type="error" message={serverError} />

            <form onSubmit={handleSubmit} noValidate>
              <label htmlFor="userId" className="label">
                User ID
              </label>
              <input
                id="userId"
                type="text"
                name="userId"
                value={form.userId}
                onChange={handleChange}
                placeholder="e.g. CSE-FAC-001"
                autoComplete="username"
                className="input"
              />
              {errors.userId && <p className="field-error">{errors.userId}</p>}

              <label htmlFor="password" className="label mt-4">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className="input pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-slate-500 hover:text-indigo-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="field-error">{errors.password}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary mt-6 w-full py-2.5"
              >
                {submitting ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
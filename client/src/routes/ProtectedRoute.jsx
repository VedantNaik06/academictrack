import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

// Wraps pages that need login (and optionally a specific role)
function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="p-8 text-slate-500">Loading...</p>;
  }

  // Not logged in -> go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role -> unauthorized page
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />; // show the child page
}

export default ProtectedRoute;
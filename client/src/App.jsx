import { Routes, Route, Navigate } from "react-router-dom";
import useAuth from "./hooks/useAuth";
import ProtectedRoute from "./routes/ProtectedRoute";
import { ROLES, ROLE_HOME } from "./utils/roles";

import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import HodDashboard from "./pages/hod/HodDashboard";

// "/" sends each user to their own dashboard (or to login)
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-8 text-slate-500">Loading...</p>;
  return <Navigate to={user ? ROLE_HOME[user.role] : "/login"} replace />;
}

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Admin only */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      {/* Faculty only */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.FACULTY]} />}>
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
      </Route>

      {/* HOD only */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.HOD]} />}>
        <Route path="/hod/dashboard" element={<HodDashboard />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function DashboardPlaceholder({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="bg-white rounded-xl shadow p-6 max-w-xl">
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        <p className="mt-3 text-slate-600">Name: {user.name}</p>
        <p className="text-slate-600">ID: {user.userId}</p>
        <p className="text-slate-600">Role: {user.role}</p>
        {user.department && (
          <p className="text-slate-600">Department: {user.department.name}</p>
        )}
        <button
          onClick={handleLogout}
          className="mt-5 bg-slate-800 text-white rounded px-4 py-2 hover:bg-slate-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default DashboardPlaceholder;
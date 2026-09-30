import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { NAV_ITEMS } from "../utils/navItems";

function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false); // used on mobile only

  const items = NAV_ITEMS[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      {/* Dark overlay behind the sidebar on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-slate-900 text-slate-200 transition-transform md:static md:shrink-0 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-5 text-xl font-bold text-white">
          AcademicTrack
        </div>
        <nav className="space-y-1 px-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `block rounded px-3 py-2 text-sm ${
                  isActive ? "bg-blue-600 text-white" : "hover:bg-slate-800"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Right side: top navbar + page content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between bg-white px-4 py-3 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded border px-3 py-1 text-sm text-slate-700 md:hidden"
          >
            Menu
          </button>
          <div className="ml-auto flex items-center gap-4 text-sm text-slate-600">
            <span>
              <strong>{user.name}</strong> ({user.role})
            </span>
            <button
              onClick={handleLogout}
              className="rounded bg-slate-800 px-3 py-1 text-white hover:bg-slate-700"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <Outlet /> {/* the current page appears here */}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
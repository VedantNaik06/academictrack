import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Icon from "../components/Icon";
import { NAV_ITEMS } from "../utils/navItems";

const ROLE_LABEL = { admin: "Admin", hod: "HOD", faculty: "Faculty" };
const ROLE_STYLE = {
  admin: "bg-purple-100 text-purple-700",
  hod: "bg-amber-100 text-amber-700",
  faculty: "bg-emerald-100 text-emerald-700",
};

function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false); // phone drawer

  const items = NAV_ITEMS[user.role] || [];
  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen md:flex">
      {/* Dark overlay behind the drawer on phones */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: drawer on phones, fixed column on md+ */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 transform flex-col bg-slate-900 text-slate-300 transition-transform duration-200 md:sticky md:top-0 md:h-screen md:shrink-0 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-lg font-bold text-white">
              A
            </span>
            <span className="text-lg font-semibold text-white">AcademicTrack</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded p-1 text-slate-400 hover:text-white md:hidden"
            aria-label="Close menu"
          >
            <Icon name="close" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon name={item.icon} className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <p className="px-5 py-4 text-xs text-slate-500">
          Academic planning and teaching progress
        </p>
      </aside>

      {/* Right side: top navbar + page content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="icon-btn md:hidden"
              aria-label="Open menu"
            >
              <Icon name="menu" />
            </button>
            <p className="hidden text-sm text-slate-500 sm:block">
              Welcome back,{" "}
              <span className="font-medium text-slate-800">
                {user.name.split(" ").slice(-1)[0]}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`badge hidden sm:inline-flex ${ROLE_STYLE[user.role]}`}
            >
              {ROLE_LABEL[user.role]}
            </span>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                {initials}
              </span>
              <div className="hidden leading-tight lg:block">
                <p className="text-sm font-medium text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-500">{user.userId}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="icon-btn"
              aria-label="Logout"
              title="Logout"
            >
              <Icon name="logout" />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
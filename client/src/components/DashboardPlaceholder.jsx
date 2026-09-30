import useAuth from "../hooks/useAuth";

function DashboardPlaceholder({ title }) {
  const { user } = useAuth();

  return (
    <div className="max-w-xl rounded-xl bg-white p-6 shadow">
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      <p className="mt-3 text-slate-600">Name: {user.name}</p>
      <p className="text-slate-600">ID: {user.userId}</p>
      <p className="text-slate-600">Role: {user.role}</p>
      {user.department && (
        <p className="text-slate-600">Department: {user.department.name}</p>
      )}
      <p className="mt-4 text-sm text-slate-500">
        The full dashboard is built in a later phase.
      </p>
    </div>
  );
}

export default DashboardPlaceholder;
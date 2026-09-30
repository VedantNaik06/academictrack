import useAuth from "../hooks/useAuth";

function DashboardPlaceholder({ title }) {
  const { user } = useAuth();

  return (
    <div>
      <div
        className="rounded-2xl p-6 text-white shadow-sm sm:p-8"
        style={{ backgroundImage: "linear-gradient(135deg, #4f46e5, #312e81)" }}
      >
        <p className="text-sm text-indigo-100">{title}</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
          Hello, {user.name}
        </h1>
        <p className="mt-2 text-sm text-indigo-100">
          The full dashboard with progress and charts is built in a later phase.
        </p>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card p-5">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            User ID
          </dt>
          <dd className="mt-1 text-lg font-semibold text-slate-900">
            {user.userId}
          </dd>
        </div>
        <div className="card p-5">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Role
          </dt>
          <dd className="mt-1 text-lg font-semibold capitalize text-slate-900">
            {user.role}
          </dd>
        </div>
        <div className="card p-5">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Department
          </dt>
          <dd className="mt-1 text-lg font-semibold text-slate-900">
            {user.department ? user.department.code : "All departments"}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default DashboardPlaceholder;
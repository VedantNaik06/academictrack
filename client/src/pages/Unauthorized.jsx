import { Link } from "react-router-dom";

function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-md p-8 text-center">
        <p className="text-5xl font-bold text-indigo-600">403</p>
        <h1 className="mt-3 text-xl font-semibold text-slate-900">
          Access denied
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          You do not have permission to view this page.
        </p>
        <Link to="/" className="btn btn-primary mt-6">
          Go to my dashboard
        </Link>
      </div>
    </div>
  );
}

export default Unauthorized;
import { Link } from "react-router-dom";

function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">403</h1>
      <p className="text-slate-600 mb-4">
        You do not have permission to view this page.
      </p>
      <Link to="/" className="text-blue-600 hover:underline">
        Go back to my dashboard
      </Link>
    </div>
  );
}

export default Unauthorized;
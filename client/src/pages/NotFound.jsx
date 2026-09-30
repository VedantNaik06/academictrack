import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">404</h1>
      <p className="text-slate-600 mb-4">Page not found.</p>
      <Link to="/" className="text-blue-600 hover:underline">
        Go home
      </Link>
    </div>
  );
}

export default NotFound;
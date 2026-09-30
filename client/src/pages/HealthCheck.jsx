import { useEffect, useState } from "react";
import api from "../services/api";

function HealthCheck() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/health")
      .then((res) => setData(res.data))
      .catch(() => setError("Cannot reach the server. Is it running on port 5000?"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-slate-800">AcademicTrack</h1>
        <p className="text-slate-500 mb-6">Setup check</p>

        {loading && <p className="text-slate-500">Checking server...</p>}

        {error && (
          <p className="rounded bg-red-100 text-red-700 p-3">{error}</p>
        )}

        {data && (
          <div className="rounded bg-green-100 text-green-800 p-3">
            <p className="font-semibold">{data.message}</p>
            <p className="text-sm mt-1">Status: {data.status}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HealthCheck;
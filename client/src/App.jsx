import { Routes, Route } from "react-router-dom";
import HealthCheck from "./pages/HealthCheck";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HealthCheck />} />
      <Route path="*" element={<p className="p-8">Page not found</p>} />
    </Routes>
  );
}

export default App;
function Alert({ type = "error", message }) {
  if (!message) return null;

  const styles =
    type === "success"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-700";

  return <p className={`mb-4 rounded p-3 text-sm ${styles}`}>{message}</p>;
}

export default Alert;
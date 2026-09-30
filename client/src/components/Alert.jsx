import Icon from "./Icon";

function Alert({ type = "error", message }) {
  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      className={`mb-4 flex items-start gap-3 rounded-lg border-l-4 p-3 text-sm ${
        isSuccess
          ? "border-green-500 bg-green-50 text-green-800"
          : "border-red-500 bg-red-50 text-red-800"
      }`}
    >
      <Icon
        name={isSuccess ? "check" : "alert"}
        className="mt-0.5 h-4 w-4 shrink-0"
      />
      <p>{message}</p>
    </div>
  );
}

export default Alert;
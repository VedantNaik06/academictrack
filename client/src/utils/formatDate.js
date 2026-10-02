// Stored dates -> DD/MM/YYYY (UTC so the day never shifts)
export const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", { timeZone: "UTC" });
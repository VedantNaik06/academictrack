export const getErrorMessage = (error) => {
  const data = error.response?.data;
  if (data?.errors?.length) {
    return `${data.message}: ${data.errors.join(", ")}`;
  }
  return data?.message || "Something went wrong. Please try again.";
};
class ApiError extends Error {
  constructor(statusCode, message, errors) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; // optional list of detailed messages
  }
}

export default ApiError;
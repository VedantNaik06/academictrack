// Runs when no route matches the request.
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Central error handler: every error in the app ends up here.
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message;
  let errors = err.errors;

  // Mongoose schema validation failed
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => e.message);
  }
  // Duplicate value in a unique field (e.g. same Faculty ID)
  else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} already exists` : "Duplicate value";
  }
  // Invalid ObjectId, e.g. /api/departments/abc
  else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

  if (statusCode === 500) {
    console.error(err); // log details on the server only
    message = "Internal server error"; // never leak internals to the client
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};
// Runs when no route matches the request. It creates a 404 error
// and passes it to the error handler below.
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Central error handler. Express recognises it by its 4 parameters.
// Every error in the app ends up here, so responses stay consistent.
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (statusCode === 500) {
    console.error(err); // log details on the server only
  }

  res.status(statusCode).json({
    success: false,
    // never expose internal error details to the client
    message: statusCode === 500 ? "Internal server error" : err.message,
  });
};
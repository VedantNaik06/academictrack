import ApiError from "../utils/ApiError.js";

// Usage in routes: validate(someZodSchema)
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const messages = result.error.issues.map((issue) => issue.message);
    return next(new ApiError(400, "Validation failed", messages));
  }

  req.body = result.data; // cleaned data (trimmed, unknown fields removed)
  next();
};

export default validate;
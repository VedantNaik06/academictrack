import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { USER_STATUS } from "../utils/constants.js";

// AUTHENTICATION: checks the token and finds who is calling
export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Not authenticated. Please log in.");
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired token. Please log in again.");
  }

  // Always load the user from the database: role, department and status
  // come from here, never from the request.
  const user = await User.findById(decoded.id);
  if (!user || user.status !== USER_STATUS.ACTIVE) {
    throw new ApiError(401, "Account not found or inactive.");
  }

  req.user = user;
  next();
});

// AUTHORIZATION: allows only the listed roles.
// Usage: authorize(ROLES.ADMIN) or authorize(ROLES.ADMIN, ROLES.HOD)
export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return next(
      new ApiError(403, "You do not have permission to perform this action.")
    );
  }
  next();
};
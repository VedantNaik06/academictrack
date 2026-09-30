import User from "../models/User.js";
import Department from "../models/Department.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";
import { USER_STATUS } from "../utils/constants.js";

// Only send safe fields to the client (never the password)
const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  userId: user.userId,
  role: user.role,
  department: user.department, // populated as { _id, name, code } where available
  status: user.status,
});

// POST /api/auth/login   (public)
export const login = asyncHandler(async (req, res) => {
  const { userId, password } = req.body;

  // password has select:false, so we ask for it explicitly here
  const user = await User.findOne({ userId: userId.toUpperCase() })
    .select("+password")
    .populate("department", "name code");

  // Same message for "no such user" and "wrong password" (do not reveal which)
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid ID or password");
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw new ApiError(403, "Your account is inactive. Please contact the admin.");
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    user: formatUser(user),
  });
});

// POST /api/auth/register   (admin only: creates admin/faculty/HOD accounts)
export const register = asyncHandler(async (req, res) => {
  const { name, email, userId, password, role, department } = req.body;

  if (department) {
    const departmentExists = await Department.findById(department);
    if (!departmentExists) {
      throw new ApiError(404, "Department not found");
    }
  }

  // Password is hashed automatically by the pre-save hook in the User model.
  // Duplicate userId/email is caught by the unique index -> 409 in errorHandler.
  const user = await User.create({
    name,
    email,
    userId,
    password,
    role,
    department,
  });

  res.status(201).json({
    success: true,
    message: "User created successfully",
    user: formatUser(user),
  });
});

// GET /api/auth/me   (any logged-in user)
export const getMe = asyncHandler(async (req, res) => {
  await req.user.populate("department", "name code");
  res.json({ success: true, user: formatUser(req.user) });
});
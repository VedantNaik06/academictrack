import mongoose from "mongoose";
import User from "../models/User.js";
import Department from "../models/Department.js";
import FacultyAssignment from "../models/FacultyAssignment.js";
import Timetable from "../models/Timetable.js";
import TeachingReport from "../models/TeachingReport.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { toSafeUser } from "../utils/safeUser.js";
import { ROLES, USER_STATUS } from "../utils/constants.js";

const LABEL = { [ROLES.FACULTY]: "Faculty", [ROLES.HOD]: "HOD" };

// Escapes characters that have a special meaning inside a regular expression
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Each export below is a function that RECEIVES a role and RETURNS the controller.
// So listUsers(ROLES.FACULTY) is the "list faculty" controller.

// GET  admin: all (optional ?department= ?status= ?search=)
//      HOD:   only their own department (taken from the database, not the request)
export const listUsers = (role) =>
  asyncHandler(async (req, res) => {
    const filter = { role };

    if (req.user.role === ROLES.ADMIN) {
      const { department } = req.query;
      if (typeof department === "string" && mongoose.isValidObjectId(department)) {
        filter.department = department;
      }
    } else {
      filter.department = req.user.department;
    }

    const { status, search } = req.query;
    if (Object.values(USER_STATUS).includes(status)) {
      filter.status = status;
    }
    if (typeof search === "string" && search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [{ name: regex }, { userId: regex }];
    }

    const users = await User.find(filter)
      .populate("department", "name code")
      .sort({ userId: 1 });

    res.json({ success: true, count: users.length, users });
  });

// POST (admin)
export const createUser = (role) =>
  asyncHandler(async (req, res) => {
    const { name, email, userId, password, department } = req.body;

    const dept = await Department.findById(department);
    if (!dept) throw new ApiError(404, "Department not found");

    // Password is hashed by the pre-save hook. Duplicate userId/email -> 409.
    const user = await User.create({ name, email, userId, password, role, department });

    // The first HOD created for a department becomes its head automatically
    if (role === ROLES.HOD && !dept.hod) {
      dept.hod = user._id;
      await dept.save();
    }

    await user.populate("department", "name code");

    res.status(201).json({
      success: true,
      message: `${LABEL[role]} created successfully`,
      user: toSafeUser(user),
    });
  });

// PUT /:id (admin). Note: userId cannot be changed.
export const updateUser = (role) =>
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ _id: req.params.id, role });
    if (!user) throw new ApiError(404, `${LABEL[role]} not found`);

    const { name, email, department, status } = req.body;

    // Moving to another department needs extra checks
    if (String(user.department) !== department) {
      const newDept = await Department.findById(department);
      if (!newDept) throw new ApiError(404, "Department not found");

      if (role === ROLES.FACULTY) {
        const assignments = await FacultyAssignment.countDocuments({ faculty: user._id });
        if (assignments) {
          throw new ApiError(
            409,
            "Cannot change department: this faculty still has subject assignments."
          );
        }
      } else {
        const isHead = await Department.exists({ hod: user._id });
        if (isHead) {
          throw new ApiError(
            409,
            "Cannot change department: remove this HOD from their department first."
          );
        }
      }
    }

    user.name = name;
    user.email = email; // undefined clears the email
    user.department = department;
    user.status = status;
    await user.save();

    // A deactivated HOD can no longer lead a department
    if (role === ROLES.HOD && status === USER_STATUS.INACTIVE) {
      await Department.updateMany({ hod: user._id }, { hod: null });
    }

    await user.populate("department", "name code");

    res.json({
      success: true,
      message: `${LABEL[role]} updated successfully`,
      user: toSafeUser(user),
    });
  });

// POST /:id/reset-password (admin)
export const resetPassword = (role) =>
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ _id: req.params.id, role });
    if (!user) throw new ApiError(404, `${LABEL[role]} not found`);

    user.password = req.body.password; // hashed by the pre-save hook
    await user.save();

    res.json({ success: true, message: "Password reset successfully" });
  });

// DELETE /:id (admin): only when nothing depends on this user
export const deleteUser = (role) =>
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ _id: req.params.id, role });
    if (!user) throw new ApiError(404, `${LABEL[role]} not found`);

    if (role === ROLES.FACULTY) {
      const [assignments, slots, reports] = await Promise.all([
        FacultyAssignment.countDocuments({ faculty: user._id }),
        Timetable.countDocuments({ faculty: user._id }),
        TeachingReport.countDocuments({ faculty: user._id }),
      ]);
      if (assignments || slots || reports) {
        throw new ApiError(
          409,
          `Cannot delete: ${assignments} assignment(s), ${slots} timetable slot(s) and ${reports} report(s) exist. Deactivate the account instead.`
        );
      }
    } else {
      const heads = await Department.countDocuments({ hod: user._id });
      if (heads) {
        throw new ApiError(
          409,
          "Cannot delete: this HOD is assigned to a department. Remove them from the department first."
        );
      }
    }

    await user.deleteOne();
    res.json({ success: true, message: `${LABEL[role]} deleted successfully` });
  });
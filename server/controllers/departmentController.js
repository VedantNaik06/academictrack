import Department from "../models/Department.js";
import User from "../models/User.js";
import Subject from "../models/Subject.js";
import AcademicYear from "../models/AcademicYear.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ROLES } from "../utils/constants.js";

// GET /api/departments   (admin: all, HOD: only their own department)
export const getDepartments = asyncHandler(async (req, res) => {
  const filter =
    req.user.role === ROLES.ADMIN ? {} : { _id: req.user.department };

  const departments = await Department.find(filter)
    .populate("hod", "name userId")
    .sort({ name: 1 });

  res.json({ success: true, count: departments.length, departments });
});

// POST /api/departments   (admin)
export const createDepartment = asyncHandler(async (req, res) => {
  const { name, code } = req.body;
  const department = await Department.create({ name, code });

  res.status(201).json({
    success: true,
    message: "Department created successfully",
    department,
  });
});

// PUT /api/departments/:id   (admin)
export const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) throw new ApiError(404, "Department not found");

  department.name = req.body.name;
  department.code = req.body.code;
  await department.save(); // duplicate name/code -> 409 via errorHandler

  res.json({
    success: true,
    message: "Department updated successfully",
    department,
  });
});

// DELETE /api/departments/:id   (admin)
export const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) throw new ApiError(404, "Department not found");

  // Referential integrity: do not delete a department that is still in use
  const [users, subjects, years] = await Promise.all([
    User.countDocuments({ department: department._id }),
    Subject.countDocuments({ department: department._id }),
    AcademicYear.countDocuments({ department: department._id }),
  ]);

  if (users || subjects || years) {
    throw new ApiError(
      409,
      `Cannot delete: department still has ${users} user(s), ${subjects} subject(s) and ${years} academic year(s).`
    );
  }

  await department.deleteOne();
  res.json({ success: true, message: "Department deleted successfully" });
});
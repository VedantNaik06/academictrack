import AcademicYear from "../models/AcademicYear.js";
import Department from "../models/Department.js";
import Subject from "../models/Subject.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ROLES } from "../utils/constants.js";

// GET /api/academic-years?department=<id>
// admin: all (optional department filter), HOD: only their own department
export const getAcademicYears = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === ROLES.ADMIN) {
    if (req.query.department) filter.department = req.query.department;
  } else {
    filter.department = req.user.department; // taken from the database, not the request
  }

  const academicYears = await AcademicYear.find(filter)
    .populate("department", "name code")
    .sort({ startDate: -1 });

  res.json({ success: true, count: academicYears.length, academicYears });
});

// POST /api/academic-years   (admin)
export const createAcademicYear = asyncHandler(async (req, res) => {
  const { academicYear, semester, department, startDate, endDate } = req.body;

  const departmentExists = await Department.findById(department);
  if (!departmentExists) throw new ApiError(404, "Department not found");

  const created = await AcademicYear.create({
    academicYear,
    semester,
    department,
    startDate,
    endDate,
  });
  await created.populate("department", "name code");

  res.status(201).json({
    success: true,
    message: "Academic year created successfully",
    academicYear: created,
  });
});

// PUT /api/academic-years/:id   (admin)
export const updateAcademicYear = asyncHandler(async (req, res) => {
  const record = await AcademicYear.findById(req.params.id);
  if (!record) throw new ApiError(404, "Academic year not found");

  const { academicYear, semester, department, startDate, endDate } = req.body;

  const departmentExists = await Department.findById(department);
  if (!departmentExists) throw new ApiError(404, "Department not found");

  record.academicYear = academicYear;
  record.semester = semester;
  record.department = department;
  record.startDate = startDate;
  record.endDate = endDate;
  await record.save();
  await record.populate("department", "name code");

  res.json({
    success: true,
    message: "Academic year updated successfully",
    academicYear: record,
  });
});

// DELETE /api/academic-years/:id   (admin)
export const deleteAcademicYear = asyncHandler(async (req, res) => {
  const record = await AcademicYear.findById(req.params.id);
  if (!record) throw new ApiError(404, "Academic year not found");

  const subjects = await Subject.countDocuments({ academicYear: record._id });
  if (subjects) {
    throw new ApiError(
      409,
      `Cannot delete: ${subjects} subject(s) belong to this academic year.`
    );
  }

  await record.deleteOne();
  res.json({ success: true, message: "Academic year deleted successfully" });
});
import mongoose from "mongoose";
import FacultyAssignment from "../models/FacultyAssignment.js";
import Subject from "../models/Subject.js";
import User from "../models/User.js";
import Timetable from "../models/Timetable.js";
import TeachingReport from "../models/TeachingReport.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ROLES, USER_STATUS } from "../utils/constants.js";

const POPULATE = [
  { path: "subject", select: "subjectName subjectCode semester" },
  { path: "faculty", select: "name userId" },
  { path: "department", select: "name code" },
  { path: "academicYear", select: "academicYear semester" },
];

// GET /api/assignments  (admin: all, HOD: own department, faculty: only their own)
export const getAssignments = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === ROLES.ADMIN) {
    const { department } = req.query;
    if (typeof department === "string" && mongoose.isValidObjectId(department)) {
      filter.department = department;
    }
  } else if (req.user.role === ROLES.HOD) {
    filter.department = req.user.department;
  } else {
    filter.faculty = req.user._id;
  }

  const assignments = await FacultyAssignment.find(filter)
    .populate(POPULATE)
    .sort({ createdAt: -1 });

  res.json({ success: true, count: assignments.length, assignments });
});

// POST /api/assignments   (admin)  body: { subject, faculty }
export const createAssignment = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.body.subject);
  if (!subject) throw new ApiError(404, "Subject not found");

  const faculty = await User.findOne({
    _id: req.body.faculty,
    role: ROLES.FACULTY,
    status: USER_STATUS.ACTIVE,
  });
  if (!faculty) throw new ApiError(404, "Active faculty member not found");

  if (String(faculty.department) !== String(subject.department)) {
    throw new ApiError(400, "Faculty and subject must belong to the same department");
  }

  if (await FacultyAssignment.exists({ subject: subject._id })) {
    throw new ApiError(409, "This subject already has a faculty member assigned");
  }

  const assignment = await FacultyAssignment.create({
    faculty: faculty._id,
    subject: subject._id,
    department: subject.department,
    academicYear: subject.academicYear,
  });
  await assignment.populate(POPULATE);

  res.status(201).json({
    success: true,
    message: "Faculty assigned successfully",
    assignment,
  });
});

// DELETE /api/assignments/:id   (admin)
export const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await FacultyAssignment.findById(req.params.id);
  if (!assignment) throw new ApiError(404, "Assignment not found");

  const [slots, reports] = await Promise.all([
    Timetable.countDocuments({ subject: assignment.subject }),
    TeachingReport.countDocuments({ subject: assignment.subject }),
  ]);
  if (slots || reports) {
    throw new ApiError(
      409,
      `Cannot unassign: ${slots} timetable slot(s) and ${reports} report(s) exist for this subject.`
    );
  }

  await assignment.deleteOne();
  res.json({ success: true, message: "Faculty unassigned successfully" });
});
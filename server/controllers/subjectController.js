import mongoose from "mongoose";
import Subject from "../models/Subject.js";
import AcademicYear from "../models/AcademicYear.js";
import FacultyAssignment from "../models/FacultyAssignment.js";
import Syllabus from "../models/Syllabus.js";
import LecturePlan from "../models/LecturePlan.js";
import Timetable from "../models/Timetable.js";
import TeachingReport from "../models/TeachingReport.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ROLES } from "../utils/constants.js";

const isId = (value) => typeof value === "string" && mongoose.isValidObjectId(value);

// Checks the academic year exists and belongs to the chosen department
const loadYearForDepartment = async (academicYear, department) => {
  const year = await AcademicYear.findById(academicYear);
  if (!year) throw new ApiError(404, "Academic year not found");
  if (String(year.department) !== department) {
    throw new ApiError(400, "This academic year belongs to a different department");
  }
  return year;
};

// GET /api/subjects
//  admin: all (optional ?department=), HOD: own department, faculty: only assigned subjects
export const getSubjects = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === ROLES.ADMIN) {
    if (isId(req.query.department)) filter.department = req.query.department;
  } else if (req.user.role === ROLES.HOD) {
    filter.department = req.user.department;
  } else {
    // Rule 1: faculty only see their assigned subjects
    filter._id = { $in: await FacultyAssignment.distinct("subject", { faculty: req.user._id }) };
  }
  if (isId(req.query.academicYear)) filter.academicYear = req.query.academicYear;

  const subjects = await Subject.find(filter)
    .populate("department", "name code")
    .populate("academicYear", "academicYear semester")
    .sort({ subjectCode: 1 });

  // Attach the assigned faculty (or null) to each subject
  const assignments = await FacultyAssignment.find({
    subject: { $in: subjects.map((s) => s._id) },
  }).populate("faculty", "name userId");
  const facultyBySubject = new Map(assignments.map((a) => [String(a.subject), a.faculty]));

  const result = subjects.map((s) => ({
    ...s.toObject(),
    faculty: facultyBySubject.get(String(s._id)) || null,
  }));

  res.json({ success: true, count: result.length, subjects: result });
});

// POST /api/subjects   (admin)
export const createSubject = asyncHandler(async (req, res) => {
  const { subjectName, subjectCode, department, academicYear } = req.body;
  const year = await loadYearForDepartment(academicYear, department);

  const subject = await Subject.create({
    subjectName,
    subjectCode,
    department,
    academicYear,
    semester: year.semester, // always copied from the academic year
  });
  await subject.populate([
    { path: "department", select: "name code" },
    { path: "academicYear", select: "academicYear semester" },
  ]);

  res.status(201).json({
    success: true,
    message: "Subject created successfully",
    subject,
  });
});

// PUT /api/subjects/:id   (admin)
export const updateSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) throw new ApiError(404, "Subject not found");

  const { subjectName, subjectCode, department, academicYear } = req.body;
  const year = await loadYearForDepartment(academicYear, department);

  const moved =
    String(subject.department) !== department ||
    String(subject.academicYear) !== academicYear;
  if (moved && (await FacultyAssignment.exists({ subject: subject._id }))) {
    throw new ApiError(
      409,
      "Cannot move this subject to another department/year: remove its faculty assignment first."
    );
  }

  subject.subjectName = subjectName;
  subject.subjectCode = subjectCode;
  subject.department = department;
  subject.academicYear = academicYear;
  subject.semester = year.semester;
  await subject.save();
  await subject.populate([
    { path: "department", select: "name code" },
    { path: "academicYear", select: "academicYear semester" },
  ]);

  res.json({ success: true, message: "Subject updated successfully", subject });
});

// DELETE /api/subjects/:id   (admin)
export const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) throw new ApiError(404, "Subject not found");

  const [assignments, topics, lectures, slots, reports] = await Promise.all([
    FacultyAssignment.countDocuments({ subject: subject._id }),
    Syllabus.countDocuments({ subject: subject._id }),
    LecturePlan.countDocuments({ subject: subject._id }),
    Timetable.countDocuments({ subject: subject._id }),
    TeachingReport.countDocuments({ subject: subject._id }),
  ]);

  if (assignments || topics || lectures || slots || reports) {
    throw new ApiError(
      409,
      `Cannot delete: ${assignments} assignment(s), ${topics} syllabus topic(s), ${lectures} lecture plan row(s), ${slots} timetable slot(s) and ${reports} report(s) exist.`
    );
  }

  await subject.deleteOne();
  res.json({ success: true, message: "Subject deleted successfully" });
});
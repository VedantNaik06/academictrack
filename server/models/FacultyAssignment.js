import mongoose from "mongoose";

const facultyAssignmentSchema = new mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Faculty is required"],
    },
    // unique: one subject has exactly one faculty
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Subject is required"],
      unique: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: [true, "Academic year is required"],
    },
  },
  { timestamps: true }
);

const FacultyAssignment = mongoose.model(
  "FacultyAssignment",
  facultyAssignmentSchema
);
export default FacultyAssignment;
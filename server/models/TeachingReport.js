import mongoose from "mongoose";
import { LECTURE_STATUS } from "../utils/constants.js";

const teachingReportSchema = new mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Faculty is required"],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Subject is required"],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    // One report per planned lecture (unique) -> no duplicate completion
    lecturePlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LecturePlan",
      required: [true, "Lecture plan is required"],
      unique: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    // Snapshot of the plan at the time of reporting
    unitNumber: { type: Number, required: true },
    chapterNumber: { type: Number, required: true },
    chapterTitle: { type: String, required: true, trim: true },
    plannedTopic: { type: String, required: true, trim: true },

    actualTopic: {
      type: String,
      required: [true, "Actual topic covered is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(LECTURE_STATUS),
      required: [true, "Lecture status is required"],
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, "Remarks cannot exceed 500 characters"],
      default: "",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Speeds up the most common queries: HOD by department/date, faculty by date
teachingReportSchema.index({ department: 1, date: -1 });
teachingReportSchema.index({ faculty: 1, date: -1 });

const TeachingReport = mongoose.model("TeachingReport", teachingReportSchema);
export default TeachingReport;
import mongoose from "mongoose";

const academicYearSchema = new mongoose.Schema(
  {
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
      trim: true,
      match: [/^\d{4}-\d{2}$/, "Academic year must look like 2026-27"],
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: [1, "Semester must be between 1 and 8"],
      max: [8, "Semester must be between 1 and 8"],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (value) {
          return !this.startDate || value > this.startDate;
        },
        message: "End date must be after start date",
      },
    },
  },
  { timestamps: true }
);

// Same department cannot have the same academic year + semester twice
academicYearSchema.index(
  { department: 1, academicYear: 1, semester: 1 },
  { unique: true }
);

const AcademicYear = mongoose.model("AcademicYear", academicYearSchema);
export default AcademicYear;
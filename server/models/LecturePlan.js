import mongoose from "mongoose";

const lecturePlanSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Subject is required"],
    },
    // Which syllabus topic (and therefore unit + chapter) this lecture belongs to
    syllabus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Syllabus",
      required: [true, "Syllabus topic is required"],
    },
    lectureNumber: {
      type: Number,
      required: [true, "Lecture number is required"],
      min: 1,
    },
    plannedTopic: {
      type: String,
      required: [true, "Planned topic is required"],
      trim: true,
    },
    plannedDate: {
      type: Date,
      required: [true, "Planned date is required"],
    },
  },
  { timestamps: true }
);

// Lecture numbers cannot repeat within a subject
lecturePlanSchema.index({ subject: 1, lectureNumber: 1 }, { unique: true });

const LecturePlan = mongoose.model("LecturePlan", lecturePlanSchema);
export default LecturePlan;
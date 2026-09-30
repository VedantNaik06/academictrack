import mongoose from "mongoose";

const syllabusSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Subject is required"],
    },
    unitNumber: {
      type: Number,
      required: [true, "Unit number is required"],
      min: 1,
    },
    unitTitle: {
      type: String,
      trim: true,
      default: "",
    },
    chapterNumber: {
      type: Number,
      required: [true, "Chapter number is required"],
      min: 1,
    },
    chapterTitle: {
      type: String,
      required: [true, "Chapter title is required"],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, "Topic is required"],
      trim: true,
    },
    plannedLectures: {
      type: Number,
      required: [true, "Planned lectures is required"],
      min: [1, "Planned lectures must be at least 1"],
    },
  },
  { timestamps: true }
);

// The same topic cannot be added twice in the same chapter of a subject
syllabusSchema.index(
  { subject: 1, unitNumber: 1, chapterNumber: 1, topic: 1 },
  { unique: true }
);

const Syllabus = mongoose.model("Syllabus", syllabusSchema);
export default Syllabus;
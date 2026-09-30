import mongoose from "mongoose";
import { DAYS } from "../utils/constants.js";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/; // 24-hour HH:mm, e.g. 10:00

const timetableSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: DAYS,
      required: [true, "Day is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [timeRegex, "Start time must be in HH:mm format"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [timeRegex, "End time must be in HH:mm format"],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Subject is required"],
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Faculty is required"],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    division: {
      type: String,
      uppercase: true,
      trim: true,
      default: "A",
    },
  },
  { timestamps: true }
);

// A faculty member cannot have two lectures at the same day and start time
timetableSchema.index({ faculty: 1, day: 1, startTime: 1 }, { unique: true });

const Timetable = mongoose.model("Timetable", timetableSchema);
export default Timetable;
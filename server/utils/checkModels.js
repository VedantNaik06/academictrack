import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Department from "../models/Department.js";
import AcademicYear from "../models/AcademicYear.js";
import Subject from "../models/Subject.js";
import FacultyAssignment from "../models/FacultyAssignment.js";
import Syllabus from "../models/Syllabus.js";
import LecturePlan from "../models/LecturePlan.js";
import Timetable from "../models/Timetable.js";
import TeachingReport from "../models/TeachingReport.js";

const models = [
  User,
  Department,
  AcademicYear,
  Subject,
  FacultyAssignment,
  Syllabus,
  LecturePlan,
  Timetable,
  TeachingReport,
];

const run = async () => {
  await connectDB();
  for (const model of models) {
    await model.init(); // creates the collection and its indexes
    console.log(`OK: ${model.modelName} -> collection "${model.collection.name}"`);
  }
  await mongoose.connection.close();
  console.log("All models loaded successfully.");
};

run();
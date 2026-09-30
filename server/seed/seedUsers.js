import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Department from "../models/Department.js";
import { ROLES } from "../utils/constants.js";

// For development/demo only. Never use a shared password like this in real life.
const DEFAULT_PASSWORD = "Password@123";

const seed = async () => {
  await connectDB();

  let cse = await Department.findOne({ code: "CSE" });
  if (!cse) {
    cse = await Department.create({
      name: "Computer Science and Engineering",
      code: "CSE",
    });
    console.log("Created department: CSE");
  }

  const users = [
    { name: "System Admin", userId: "ADMIN-001", role: ROLES.ADMIN },
    { name: "Prof. HOD CSE", userId: "CSE-HOD-001", role: ROLES.HOD, department: cse._id },
    { name: "Prof. ABC", userId: "CSE-FAC-001", role: ROLES.FACULTY, department: cse._id },
  ];

  for (const data of users) {
    const exists = await User.findOne({ userId: data.userId });
    if (exists) {
      console.log(`Skipped (already exists): ${data.userId}`);
      continue;
    }
    await User.create({ ...data, password: DEFAULT_PASSWORD });
    console.log(`Created: ${data.userId}`);
  }

  // Make the CSE HOD the department's head
  const hod = await User.findOne({ userId: "CSE-HOD-001" });
  cse.hod = hod._id;
  await cse.save();

  await mongoose.connection.close();
  console.log(`Done. Login password for all users: ${DEFAULT_PASSWORD}`);
};

seed();
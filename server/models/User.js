import mongoose from "mongoose";
import { ROLES, USER_STATUS } from "../utils/constants.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true, // allows several users without an email
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    // Login ID: admin ID / faculty ID / HOD ID, e.g. CSE-FAC-001
    userId: {
      type: String,
      required: [true, "User ID is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never returned in queries unless explicitly requested
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: [true, "Role is required"],
    },
    // Required for faculty and HOD, not for admin
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
      required: [
        function () {
          return this.role !== ROLES.ADMIN;
        },
        "Department is required for faculty and HOD",
      ],
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
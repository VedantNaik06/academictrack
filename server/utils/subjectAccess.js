import mongoose from "mongoose";
import Subject from "../models/Subject.js";
import FacultyAssignment from "../models/FacultyAssignment.js";
import ApiError from "./ApiError.js";
import { ROLES } from "./constants.js";

// Returns the subject if this user is allowed to see it, otherwise throws.
//  - admin:   any subject
//  - HOD:     only subjects of their own department
//  - faculty: only subjects assigned to them
export const getAccessibleSubject = async (user, subjectId) => {
  if (typeof subjectId !== "string" || !mongoose.isValidObjectId(subjectId)) {
    throw new ApiError(400, "A valid subject id is required");
  }

  const subject = await Subject.findById(subjectId);
  if (!subject) throw new ApiError(404, "Subject not found");

  if (user.role === ROLES.ADMIN) return subject;

  if (user.role === ROLES.HOD) {
    if (String(subject.department) !== String(user.department)) {
      throw new ApiError(403, "You can only access subjects of your own department");
    }
    return subject;
  }

  const assigned = await FacultyAssignment.exists({
    subject: subject._id,
    faculty: user._id,
  });
  if (!assigned) throw new ApiError(403, "This subject is not assigned to you");
  return subject;
};
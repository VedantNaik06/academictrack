import { z } from "zod";
import { ROLES } from "../utils/constants.js";

const objectId = /^[0-9a-fA-F]{24}$/; // format of a MongoDB ObjectId

export const loginSchema = z.object({
  userId: z.string().trim().min(1, "User ID is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().trim().email("Please enter a valid email").optional(),
    userId: z.string().trim().min(3, "User ID is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(Object.values(ROLES), { message: "Invalid role" }),
    department: z
      .string()
      .regex(objectId, "Invalid department id")
      .optional(),
  })
  .refine((data) => data.role === ROLES.ADMIN || data.department, {
    message: "Department is required for faculty and HOD",
    path: ["department"],
  });
import { z } from "zod";
import { USER_STATUS } from "../utils/constants.js";

const objectId = /^[0-9a-fA-F]{24}$/;

const baseFields = {
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email").optional(),
  department: z.string().regex(objectId, "Invalid department id"),
};

// Used when creating faculty / HOD
export const createUserSchema = z.object({
  ...baseFields,
  userId: z.string().trim().min(3, "User ID must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Used when updating (the userId is intentionally NOT editable)
export const updateUserSchema = z.object({
  ...baseFields,
  status: z.enum(Object.values(USER_STATUS), { message: "Invalid status" }),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});
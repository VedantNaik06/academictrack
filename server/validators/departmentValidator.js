import { z } from "zod";

const objectId = /^[0-9a-fA-F]{24}$/;

export const departmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Department name must be at least 2 characters"),
  code: z
    .string()
    .trim()
    .min(2, "Department code must be at least 2 characters")
    .max(10, "Department code cannot exceed 10 characters"),
});

// hod = id of the HOD user, or null to remove the current HOD
export const assignHodSchema = z.object({
  hod: z.string().regex(objectId, "Invalid HOD id").nullable(),
});
import { z } from "zod";

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
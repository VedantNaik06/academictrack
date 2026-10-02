import { z } from "zod";

const objectId = /^[0-9a-fA-F]{24}$/;

export const subjectSchema = z.object({
  subjectName: z.string().trim().min(2, "Subject name must be at least 2 characters"),
  subjectCode: z
    .string()
    .trim()
    .min(2, "Subject code must be at least 2 characters")
    .max(15, "Subject code cannot exceed 15 characters"),
  department: z.string().regex(objectId, "Invalid department id"),
  academicYear: z.string().regex(objectId, "Invalid academic year id"),
});

export const assignmentSchema = z.object({
  subject: z.string().regex(objectId, "Invalid subject id"),
  faculty: z.string().regex(objectId, "Invalid faculty id"),
});

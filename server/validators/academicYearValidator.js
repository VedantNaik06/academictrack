import { z } from "zod";

const objectId = /^[0-9a-fA-F]{24}$/;

const dateString = (label) =>
  z.string().refine((value) => !Number.isNaN(Date.parse(value)), `${label} is invalid`);

export const academicYearSchema = z
  .object({
    academicYear: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}$/, "Academic year must look like 2026-27"),
    semester: z
      .number({ message: "Semester must be a number" })
      .int("Semester must be a whole number")
      .min(1, "Semester must be between 1 and 8")
      .max(8, "Semester must be between 1 and 8"),
    department: z.string().regex(objectId, "Invalid department id"),
    startDate: dateString("Start date"),
    endDate: dateString("End date"),
  })
  .refine((data) => Date.parse(data.endDate) > Date.parse(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });
import { z } from "zod";

const objectId = /^[0-9a-fA-F]{24}$/;

const dateString = (label) =>
  z.string().refine((value) => !Number.isNaN(Date.parse(value)), `${label} is invalid`);

const lectureFields = {
  syllabus: z.string().regex(objectId, "Invalid syllabus topic id"),
  lectureNumber: z
    .number({ message: "Lecture number must be a number" })
    .int("Lecture number must be a whole number")
    .min(1, "Lecture number must be at least 1"),
  plannedTopic: z.string().trim().min(2, "Planned topic must be at least 2 characters"),
  plannedDate: dateString("Planned date"),
};

export const createLectureSchema = z.object({
  subject: z.string().regex(objectId, "Invalid subject id"),
  ...lectureFields,
});

export const updateLectureSchema = z.object(lectureFields);

export const generatePlanSchema = z.object({
  subject: z.string().regex(objectId, "Invalid subject id"),
  startDate: dateString("Start date"),
  lecturesPerWeek: z
    .number({ message: "Lectures per week must be a number" })
    .int("Lectures per week must be a whole number")
    .min(1, "Lectures per week must be between 1 and 6")
    .max(6, "Lectures per week must be between 1 and 6"),
});
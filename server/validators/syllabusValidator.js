import { z } from "zod";

const objectId = /^[0-9a-fA-F]{24}$/;

const topicFields = {
  unitNumber: z
    .number({ message: "Unit number must be a number" })
    .int("Unit number must be a whole number")
    .min(1, "Unit number must be at least 1"),
  unitTitle: z.string().trim().max(100, "Unit title is too long").optional(),
  chapterNumber: z
    .number({ message: "Chapter number must be a number" })
    .int("Chapter number must be a whole number")
    .min(1, "Chapter number must be at least 1"),
  chapterTitle: z.string().trim().min(2, "Chapter title must be at least 2 characters"),
  topic: z.string().trim().min(2, "Topic must be at least 2 characters"),
  plannedLectures: z
    .number({ message: "Planned lectures must be a number" })
    .int("Planned lectures must be a whole number")
    .min(1, "Planned lectures must be at least 1")
    .max(20, "Planned lectures cannot exceed 20"),
};

export const createTopicSchema = z.object({
  subject: z.string().regex(objectId, "Invalid subject id"),
  ...topicFields,
});

export const updateTopicSchema = z.object(topicFields);
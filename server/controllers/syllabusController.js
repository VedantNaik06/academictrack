import Syllabus from "../models/Syllabus.js";
import LecturePlan from "../models/LecturePlan.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getAccessibleSubject } from "../utils/subjectAccess.js";

// GET /api/syllabus?subject=<id>   (admin, HOD of the department, assigned faculty)
export const getSyllabus = asyncHandler(async (req, res) => {
  const subject = await getAccessibleSubject(req.user, req.query.subject);

  const topics = await Syllabus.find({ subject: subject._id }).sort({
    unitNumber: 1,
    chapterNumber: 1,
    createdAt: 1,
  });

  res.json({ success: true, count: topics.length, topics });
});

// POST /api/syllabus   (admin)
export const createTopic = asyncHandler(async (req, res) => {
  const { subject: subjectId, ...fields } = req.body;
  const subject = await getAccessibleSubject(req.user, subjectId);

  // Duplicate topic in the same chapter -> 409 from the unique index
  const topic = await Syllabus.create({ subject: subject._id, ...fields });

  res.status(201).json({
    success: true,
    message: "Topic added successfully",
    topic,
  });
});

// PUT /api/syllabus/:id   (admin)
export const updateTopic = asyncHandler(async (req, res) => {
  const topic = await Syllabus.findById(req.params.id);
  if (!topic) throw new ApiError(404, "Topic not found");

  const { unitNumber, unitTitle, chapterNumber, chapterTitle, topic: name, plannedLectures } =
    req.body;

  topic.unitNumber = unitNumber;
  topic.unitTitle = unitTitle || "";
  topic.chapterNumber = chapterNumber;
  topic.chapterTitle = chapterTitle;
  topic.topic = name;
  topic.plannedLectures = plannedLectures;
  await topic.save();

  res.json({ success: true, message: "Topic updated successfully", topic });
});

// DELETE /api/syllabus/:id   (admin)
export const deleteTopic = asyncHandler(async (req, res) => {
  const topic = await Syllabus.findById(req.params.id);
  if (!topic) throw new ApiError(404, "Topic not found");

  const lectures = await LecturePlan.countDocuments({ syllabus: topic._id });
  if (lectures) {
    throw new ApiError(
      409,
      `Cannot delete: ${lectures} lecture plan row(s) use this topic. Remove them first.`
    );
  }

  await topic.deleteOne();
  res.json({ success: true, message: "Topic deleted successfully" });
});
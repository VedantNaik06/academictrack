import LecturePlan from "../models/LecturePlan.js";
import Syllabus from "../models/Syllabus.js";
import TeachingReport from "../models/TeachingReport.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getAccessibleSubject } from "../utils/subjectAccess.js";

const TOPIC_FIELDS = "unitNumber chapterNumber chapterTitle topic";

// A lecture row may only point to a syllabus topic of the SAME subject
const assertTopicBelongs = async (syllabusId, subjectId) => {
  const topic = await Syllabus.findOne({ _id: syllabusId, subject: subjectId });
  if (!topic) throw new ApiError(400, "This syllabus topic does not belong to the subject");
  return topic;
};

// GET /api/lecture-plans?subject=<id>
export const getLecturePlans = asyncHandler(async (req, res) => {
  const subject = await getAccessibleSubject(req.user, req.query.subject);

  const lectures = await LecturePlan.find({ subject: subject._id })
    .populate("syllabus", TOPIC_FIELDS)
    .sort({ lectureNumber: 1 });

  res.json({ success: true, count: lectures.length, lectures });
});

// POST /api/lecture-plans   (admin)
export const createLecture = asyncHandler(async (req, res) => {
  const { subject: subjectId, syllabus, lectureNumber, plannedTopic, plannedDate } = req.body;
  const subject = await getAccessibleSubject(req.user, subjectId);
  await assertTopicBelongs(syllabus, subject._id);

  // Same lecture number twice in a subject -> 409 from the unique index
  const lecture = await LecturePlan.create({
    subject: subject._id,
    syllabus,
    lectureNumber,
    plannedTopic,
    plannedDate,
  });
  await lecture.populate("syllabus", TOPIC_FIELDS);

  res.status(201).json({ success: true, message: "Lecture added successfully", lecture });
});

// PUT /api/lecture-plans/:id   (admin)
export const updateLecture = asyncHandler(async (req, res) => {
  const lecture = await LecturePlan.findById(req.params.id);
  if (!lecture) throw new ApiError(404, "Lecture not found");

  const { syllabus, lectureNumber, plannedTopic, plannedDate } = req.body;
  await assertTopicBelongs(syllabus, lecture.subject);

  lecture.syllabus = syllabus;
  lecture.lectureNumber = lectureNumber;
  lecture.plannedTopic = plannedTopic;
  lecture.plannedDate = plannedDate;
  await lecture.save();
  await lecture.populate("syllabus", TOPIC_FIELDS);

  res.json({ success: true, message: "Lecture updated successfully", lecture });
});

// DELETE /api/lecture-plans/:id   (admin)
export const deleteLecture = asyncHandler(async (req, res) => {
  const lecture = await LecturePlan.findById(req.params.id);
  if (!lecture) throw new ApiError(404, "Lecture not found");

  if (await TeachingReport.exists({ lecturePlan: lecture._id })) {
    throw new ApiError(409, "Cannot delete: a teaching report exists for this lecture.");
  }

  await lecture.deleteOne();
  res.json({ success: true, message: "Lecture deleted successfully" });
});

// DELETE /api/lecture-plans/subject/:subjectId   (admin): clear the whole plan
export const clearLecturePlan = asyncHandler(async (req, res) => {
  const subject = await getAccessibleSubject(req.user, req.params.subjectId);

  if (await TeachingReport.exists({ subject: subject._id })) {
    throw new ApiError(409, "Cannot clear the plan: teaching reports exist for this subject.");
  }

  const result = await LecturePlan.deleteMany({ subject: subject._id });
  res.json({
    success: true,
    message: `${result.deletedCount} lecture(s) removed from the plan`,
  });
});

// POST /api/lecture-plans/generate   (admin)
// Creates numbered lecture rows from the syllabus (plannedLectures per topic)
// and spreads their planned dates over the weeks.
export const generateLecturePlan = asyncHandler(async (req, res) => {
  const { subject: subjectId, startDate, lecturesPerWeek } = req.body;
  const subject = await getAccessibleSubject(req.user, subjectId);

  if (await LecturePlan.exists({ subject: subject._id })) {
    throw new ApiError(
      409,
      "A lecture plan already exists. Clear it first, or edit lectures one by one."
    );
  }

  const topics = await Syllabus.find({ subject: subject._id }).sort({
    unitNumber: 1,
    chapterNumber: 1,
    createdAt: 1,
  });
  if (topics.length === 0) {
    throw new ApiError(400, "Add syllabus topics before generating a lecture plan");
  }

  const start = new Date(startDate);
  const rows = [];
  let count = 0;

  for (const topic of topics) {
    for (let part = 1; part <= topic.plannedLectures; part++) {
      // Spread the lectures of a week over its 6 working days
      const week = Math.floor(count / lecturesPerWeek);
      const slot = count % lecturesPerWeek;
      const dayOffset = week * 7 + Math.floor((slot * 6) / lecturesPerWeek);

      const plannedDate = new Date(start);
      plannedDate.setUTCDate(plannedDate.getUTCDate() + dayOffset);

      count++;
      rows.push({
        subject: subject._id,
        syllabus: topic._id,
        lectureNumber: count,
        plannedTopic:
          topic.plannedLectures > 1
            ? `${topic.topic} (Part ${part} of ${topic.plannedLectures})`
            : topic.topic,
        plannedDate,
      });
    }
  }

  await LecturePlan.insertMany(rows);

  res.status(201).json({
    success: true,
    message: `${rows.length} lectures generated`,
  });
});
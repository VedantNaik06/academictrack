import express from "express";
import {
  getLecturePlans,
  createLecture,
  updateLecture,
  deleteLecture,
  clearLecturePlan,
  generateLecturePlan,
} from "../controllers/lecturePlanController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import {
  createLectureSchema,
  updateLectureSchema,
  generatePlanSchema,
} from "../validators/lecturePlanValidator.js";
import { ROLES } from "../utils/constants.js";

const router = express.Router();
router.use(protect);

router.get("/", authorize(ROLES.ADMIN, ROLES.HOD, ROLES.FACULTY), getLecturePlans);
router.post("/generate", authorize(ROLES.ADMIN), validate(generatePlanSchema), generateLecturePlan);
router.post("/", authorize(ROLES.ADMIN), validate(createLectureSchema), createLecture);
router.delete("/subject/:subjectId", authorize(ROLES.ADMIN), clearLecturePlan);
router.put("/:id", authorize(ROLES.ADMIN), validate(updateLectureSchema), updateLecture);
router.delete("/:id", authorize(ROLES.ADMIN), deleteLecture);

export default router;
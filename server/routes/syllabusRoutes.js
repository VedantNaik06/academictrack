import express from "express";
import {
  getSyllabus,
  createTopic,
  updateTopic,
  deleteTopic,
} from "../controllers/syllabusController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { createTopicSchema, updateTopicSchema } from "../validators/syllabusValidator.js";
import { ROLES } from "../utils/constants.js";

const router = express.Router();
router.use(protect);

router.get("/", authorize(ROLES.ADMIN, ROLES.HOD, ROLES.FACULTY), getSyllabus);
router.post("/", authorize(ROLES.ADMIN), validate(createTopicSchema), createTopic);
router.put("/:id", authorize(ROLES.ADMIN), validate(updateTopicSchema), updateTopic);
router.delete("/:id", authorize(ROLES.ADMIN), deleteTopic);

export default router;
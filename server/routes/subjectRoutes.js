import express from "express";
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/subjectController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { subjectSchema } from "../validators/subjectValidator.js";
import { ROLES } from "../utils/constants.js";

const router = express.Router();
router.use(protect);

router.get("/", authorize(ROLES.ADMIN, ROLES.HOD, ROLES.FACULTY), getSubjects);
router.post("/", authorize(ROLES.ADMIN), validate(subjectSchema), createSubject);
router.put("/:id", authorize(ROLES.ADMIN), validate(subjectSchema), updateSubject);
router.delete("/:id", authorize(ROLES.ADMIN), deleteSubject);

export default router;
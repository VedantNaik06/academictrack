import express from "express";
import {
  getAssignments,
  createAssignment,
  deleteAssignment,
} from "../controllers/assignmentController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { assignmentSchema } from "../validators/subjectValidator.js";
import { ROLES } from "../utils/constants.js";

const router = express.Router();
router.use(protect);

router.get("/", authorize(ROLES.ADMIN, ROLES.HOD, ROLES.FACULTY), getAssignments);
router.post("/", authorize(ROLES.ADMIN), validate(assignmentSchema), createAssignment);
router.delete("/:id", authorize(ROLES.ADMIN), deleteAssignment);

export default router;
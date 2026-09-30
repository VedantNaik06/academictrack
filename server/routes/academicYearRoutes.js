import express from "express";
import {
  getAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
} from "../controllers/academicYearController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { academicYearSchema } from "../validators/academicYearValidator.js";
import { ROLES } from "../utils/constants.js";

const router = express.Router();

router.use(protect);

router.get("/", authorize(ROLES.ADMIN, ROLES.HOD), getAcademicYears);
router.post("/", authorize(ROLES.ADMIN), validate(academicYearSchema), createAcademicYear);
router.put("/:id", authorize(ROLES.ADMIN), validate(academicYearSchema), updateAcademicYear);
router.delete("/:id", authorize(ROLES.ADMIN), deleteAcademicYear);

export default router;
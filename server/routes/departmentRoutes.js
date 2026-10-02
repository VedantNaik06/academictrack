import express from "express";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  assignHod,
  deleteDepartment,
} from "../controllers/departmentController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import {
  departmentSchema,
  assignHodSchema,
} from "../validators/departmentValidator.js";
import { ROLES } from "../utils/constants.js";

const router = express.Router();

router.use(protect); // every route below requires login

router.get("/", authorize(ROLES.ADMIN, ROLES.HOD), getDepartments);
router.post("/", authorize(ROLES.ADMIN), validate(departmentSchema), createDepartment);
router.put("/:id", authorize(ROLES.ADMIN), validate(departmentSchema), updateDepartment);
router.put("/:id/hod", authorize(ROLES.ADMIN), validate(assignHodSchema), assignHod);
router.delete("/:id", authorize(ROLES.ADMIN), deleteDepartment);

export default router;
import express from "express";
import {
  listUsers,
  createUser,
  updateUser,
  resetPassword,
  deleteUser,
} from "../controllers/userManagementController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
} from "../validators/userValidator.js";
import { ROLES } from "../utils/constants.js";

// Builds the 5 routes for one role. "listRoles" = who may VIEW the list.
const buildUserRouter = (role, listRoles) => {
  const router = express.Router();
  router.use(protect);

  router.get("/", authorize(...listRoles), listUsers(role));
  router.post("/", authorize(ROLES.ADMIN), validate(createUserSchema), createUser(role));
  router.put("/:id", authorize(ROLES.ADMIN), validate(updateUserSchema), updateUser(role));
  router.post(
    "/:id/reset-password",
    authorize(ROLES.ADMIN),
    validate(resetPasswordSchema),
    resetPassword(role)
  );
  router.delete("/:id", authorize(ROLES.ADMIN), deleteUser(role));

  return router;
};

// Faculty list: admin sees all, HOD sees only their department (controller filters)
export const facultyRoutes = buildUserRouter(ROLES.FACULTY, [ROLES.ADMIN, ROLES.HOD]);

// HOD management: admin only
export const hodRoutes = buildUserRouter(ROLES.HOD, [ROLES.ADMIN]);
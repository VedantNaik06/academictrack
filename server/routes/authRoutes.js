import express from "express";
import { login, register, getMe } from "../controllers/authController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../validators/authValidator.js";
import { ROLES } from "../utils/constants.js";

const router = express.Router();

router.post("/login", validate(loginSchema), login);
router.post(
  "/register",
  protect,
  authorize(ROLES.ADMIN),
  validate(registerSchema),
  register
);
router.get("/me", protect, getMe);

export default router;
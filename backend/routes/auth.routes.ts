import { Router } from "express";
import { attachUser } from "../middleware/auth";
import {
  googleCallback,
  googleStart,
  login,
  me,
  register,
  resendVerification,
  verifyEmail,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", register());
router.post("/login", login());
router.get("/me", attachUser, me());
router.get("/verify-email", verifyEmail());
router.post("/resend-verification", resendVerification());
router.get("/google/start", googleStart());
router.get("/google/callback", googleCallback());

export default router;

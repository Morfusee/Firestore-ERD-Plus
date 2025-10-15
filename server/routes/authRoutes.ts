import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  authenticateUser,
  googleAuthFailed,
  googleCallback,
  googleAuth,
  emailVerifiedStatus,
} from "@root/controllers/authController";
import {
  validateToken,
  validate,
} from "@root/middleware/validators/authValidator";
import { validateUser } from "@root/middleware/validators/userValidator";
import dotenv from "dotenv";
import passport from "../config/passport";

dotenv.config();

const router = express.Router();

// Firebase Auth routes
router.post("/register", [...validateUser, validate], registerUser);
router.post("/login", loginUser);
router.post("/logout", [validateToken, validate], logoutUser);
router.post("/reset-password", resetPassword);
router.get("/check-auth", [validateToken, validate], authenticateUser);
router.get(
  "/email-verified-status",
  [validateToken, validate],
  emailVerifiedStatus
);

// Google OAuth routes
router.get("/google/callback", googleCallback);
router.get("/google", googleAuth);
router.get("/google/callback/failed", googleAuthFailed);

export default router;

import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  authenticateUser,
} from "@root/controllers/authController";
import { verifyToken } from "@root/middleware/validators/authValidator";
import { validateUser } from "@root/middleware/validators/userValidator";

const router = express.Router();

router.post("/register", [...validateUser], registerUser);
router.post("/login", loginUser);
router.post("/logout", [verifyToken], logoutUser);
router.post("/reset-password", resetPassword);
router.get("/check-auth", [verifyToken], authenticateUser);

export default router;

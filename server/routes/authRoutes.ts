import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
} from "@root/controllers/authController";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/reset-password", resetPassword);

export default router;

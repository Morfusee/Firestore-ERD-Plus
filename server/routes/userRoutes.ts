import express from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUser,
} from "../controllers/userController";

import { validateUser } from "../middleware/userValidator";

const router = express.Router();

// Route for all users
router.get("", getAllUsers);

// Route for getting users by email
router.get("/search", getUserByEmail);

// Route for a specific user by ID
router.get("/:id", getUserById);

// Route for creating a new user
router.post("", validateUser, createUser);

// Route for updating a user by ID
router.patch("/:id", updateUser);

export default router;

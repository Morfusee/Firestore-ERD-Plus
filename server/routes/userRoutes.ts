import express from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
  getOwnedProjectsByUserId,
} from "../controllers/userController";

import {
  validateEmailQuery,
  validateUser,
} from "../middleware/validators/userValidator";
import { verifyToken } from "../middleware/validators/authValidator";

const router = express.Router();

// Route for all users
router.get("", [verifyToken], getAllUsers);

// Route for getting users by email
router.get("/search", [verifyToken, ...validateEmailQuery], getUserByEmail);

// Route for a specific user by ID
router.get("/:id", [verifyToken], getUserById);

// Route for getting all projects by user ID
router.get("/:id/projects", [verifyToken], getOwnedProjectsByUserId);

// Route for creating a new user
router.post("", [...validateUser], createUser);

// Route for updating a user by ID
router.patch("/:id", [verifyToken], updateUser);

// Route for deleting a user by ID
router.delete("/:id", [verifyToken], deleteUser);

export default router;

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
import {
  validate,
  validateToken,
} from "../middleware/validators/authValidator";

const router = express.Router();

// Route for all users
router.get("", [validateToken, validate], getAllUsers);

// Route for getting users by email
router.get(
  "/search",
  [validateToken, ...validateEmailQuery, validate],
  getUserByEmail
);

// Route for a specific user by ID
router.get("/:id", [validateToken, validate], getUserById);

// Route for getting all projects by user ID
router.get(
  "/:id/projects",
  [validateToken, validate],
  getOwnedProjectsByUserId
);

// Route for creating a new user
router.post("", [...validateUser, validate], createUser);

// Route for updating a user by ID
router.patch("/:id", [validateToken, validate], updateUser);

// Route for deleting a user by ID
router.delete("/:id", [validateToken, validate], deleteUser);

export default router;

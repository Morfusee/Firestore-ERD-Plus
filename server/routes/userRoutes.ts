import express from "express";
import { RequestHandler } from "express";

import {
  createUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUser,
  uploadProfilePicture,
  deleteUser,
  getOwnedProjectsByUserId,
  getUserByUsername,
} from "../controllers/userController";

import {
  validateEmailQuery,
  validateUser,
} from "../middleware/validators/userValidator";
import {
  validate,
  validateToken,
} from "../middleware/validators/authValidator";
import upload from "../middleware/multer";
import { compressImage } from "../middleware/compressImageMiddleware";

const router = express.Router();

// Route for getting users by username
router.get("/search", [validateToken, validate], getUserByUsername);

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

// Route for uploading a profile picture
router.patch(
  "/:id/profile-picture",
  [
    validateToken,
    validate,
    upload.single("profilePicture"),
    compressImage,
  ] as RequestHandler[],
  uploadProfilePicture
);

export default router;

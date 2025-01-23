import express from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
  editProject,
  deleteProject,
} from "../controllers/projectController";
import { encryptDataMiddleware } from "@root/middleware/encryptDataMiddleware";
import {
  validate,
  validateRequestBodyNotEmpty,
  validateMembersUpdateRestriction,
  validateProjectId,
} from "@root/middleware/projectValidator";

const router = express.Router();

// Define routes
router.get("", getAllProjects);
router.get("/:id", [validateProjectId, validate], getProjectById);
router.patch(
  "/:id",
  [validateRequestBodyNotEmpty, validateMembersUpdateRestriction, validate],
  editProject
);
router.post("", createProject);
router.delete("/:id", deleteProject);

export default router;

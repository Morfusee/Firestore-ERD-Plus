import express from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
  editProject,
  deleteProject,
} from "../controllers/projectController";
import { encryptDataMiddleware } from "@root/middleware/encryptDataMiddleware";
import { validate, validateProjectId } from "@root/middleware/projectValidator";

const router = express.Router();

// Define routes
router.get("", getAllProjects);
router.get("/:id", [validateProjectId, validate], getProjectById);
router.patch("/:id", editProject);
router.post("", createProject);
router.delete("/:id", deleteProject);

export default router;

import express from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
  editProject,
  deleteProject,
} from "../controllers/projectController";
import { encryptDataMiddleware } from "@root/middleware/encryptDataMiddleware";

const router = express.Router();

// Define routes
router.get("", getAllProjects);
router.get("/:id", getProjectById);
router.patch("/:id", editProject);
router.post("", createProject);
router.delete("/:id", deleteProject);

export default router;

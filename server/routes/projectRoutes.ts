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
router.patch("/:id", encryptDataMiddleware, editProject);
router.post("", encryptDataMiddleware, createProject);
router.delete("/:id", deleteProject);

export default router;

import express from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
} from "../controllers/projectController";

const router = express.Router();

// Define routes
router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.post("/share", createProject);

export default router;

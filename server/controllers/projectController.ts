import { Request, Response } from "express";
import Project from "../models/projectModel.ts";
import { decrypt, encrypt } from "@root/utils/encryption.ts";
import NotFoundError from "@root/errors/NotFoundError.ts";

// Get all projects
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    // Find all projects
    const projects = await Project.find();

    // If no projects are found, throw an error
    if (!projects) throw new NotFoundError("No projects found.");

    // Return the projects
    res.status(200).json(projects);
  } catch (err: any) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Get a project by ID
export const getProjectById = async (req: Request, res: Response) => {
  try {
    // Find the project by ID
    const project = await Project.findById(req.params.id);

    // Check if the project exists
    if (!project) throw new NotFoundError("Project not found.");

    // Return the project
    res.status(200).json(project);
  } catch (err: any) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Edit a project
export const editProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({
        message: "Project not found",
      });
    }

    // Check if body is empty
    if (
      Object.keys(req.body).length === 0 ||
      Object.values(req.body).some((value) => value === "")
    ) {
      res.status(400).json({
        message: "Request body is empty or contains empty values",
      });

      // Exit the function
      return;
    }

    // Update the project
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // Send the response
    res.status(200).json({
      message: "Project updated successfully",
    });
  } catch (err: any) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Create a new project for sharing
export const createProject = async (req: Request, res: Response) => {
  try {
    // Encrypt the data
    const project = new Project(req.body);

    // Save the project
    const savedProject = await project.save();

    // Send the response
    res.status(201).json(savedProject);
  } catch (err: any) {
    // Handle errors
    res.status(400).json({
      message: err.message,
    });
  }
};

// Delete a project
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      res.status(404).json({
        message: "Project does not exist.",
      });

      return;
    }

    res.status(200).json({
      message: "Project deleted successfully.",
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error deleting project: " + error.message,
    });
  }
};

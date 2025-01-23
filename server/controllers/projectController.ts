import { Request, Response } from "express";
import Project from "../models/projectModel.ts";
import { decrypt, encrypt } from "@root/utils/encryption.ts";
import NotFoundError from "@root/errors/NotFoundError.ts";
import mongoose from "mongoose";
import ConflictError from "@root/errors/ConflictError.ts";

/**
 * Get projects based on query parameters.
 * If `userId` is provided in the query, it fetches projects associated with that user.
 * Otherwise, it fetches all projects.
 */
export const getProjects = async (req: Request, res: Response) => {
  if (req.query.userId) {
    return getProjectsByUserId(req, res);
  }

  // If no userId is provided, fetch all projects
  return getAllProjects(req, res);
};

// Get all projects by user ID
export const getProjectsByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    const projectsByUser = await Project.find({
      "members.userId": userId,
    });

    if (!projectsByUser) throw new NotFoundError("No projects found.");

    res.status(200).json(projectsByUser);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get all projects
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    // Find all projects
    const projects = await Project.find();

    // If no projects are found, throw an error
    if (!projects || projects.length === 0)
      throw new NotFoundError("No projects found.");

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
    // Find the project by ID
    const project = await Project.findById(req.params.id);

    // Check if the project exists
    if (!project) throw new NotFoundError("Project not found.");

    // Update the project
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // Send the response
    res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject,
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
    const { name, icon, userId } = req.body;

    // Create a new project
    const project = new Project({
      name,
      icon,
      members: [
        {
          userId: userId,
          role: "owner",
        },
      ],
    });

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

// Save data to a project
export const saveProject = async (req: Request, res: Response) => {
  try {
    // Find the project by ID
    const project = await Project.findById(req.params.id);

    // Check if the project exists
    if (!project) throw new ConflictError("Project does not exist.");

    project.data = req.body.data;

    // Save the project
    const savedProject = await project.save();

    res.status(200).json({
      message: "Project data saved successfully.",
      project: savedProject,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete a project
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) throw new NotFoundError("Project not found.");

    res.status(200).json({
      message: "Project deleted successfully.",
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

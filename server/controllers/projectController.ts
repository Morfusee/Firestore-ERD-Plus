import { NextFunction, Request, Response } from "express";
import Project from "../models/projectModel.ts";
import { decrypt, encrypt } from "@root/utils/encryption.ts";
import NotFoundError from "@root/errors/NotFoundError.ts";
import mongoose from "mongoose";
import ConflictError from "@root/errors/ConflictError.ts";
import User from "@root/models/userModel.ts";
import { SuccessResponse } from "@root/success/SuccessResponse.ts";

/**
 * Get projects based on query parameters.
 * If `userId` is provided in the query, it fetches projects associated with that user.
 * Otherwise, it fetches all projects.
 */
export const getProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.query.userId) {
    return getProjectsByUserId(req, res, next);
  }

  // If no userId is provided, fetch all projects
  return getAllProjects(req, res, next);
};

// Get all projects by user ID
export const getProjectsByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.query;

    const projectsByUser = await Project.find({
      "members.userId": userId,
    });

    if (!projectsByUser) throw new NotFoundError("No projects found.");

    // Send templated response
    next(
      new SuccessResponse(200, "Projects successfully fetched.", {
        projects: projectsByUser,
      })
    );
  } catch (error: any) {
    next(error);
  }
};

// Get all projects
export const getAllProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Find all projects
    const projects = await Project.find();

    // If no projects are found, throw an error
    if (!projects || projects.length === 0)
      throw new NotFoundError("No projects found.");

    // Return the projects
    next(
      new SuccessResponse(200, "Successfully fetched all projects.", {
        projects,
      })
    );
  } catch (err: any) {
    next(err);
  }
};

// Get a project by ID
export const getProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Find the project by ID
    const project = await Project.findById(req.params.id);

    // Check if the project exists
    if (!project) throw new NotFoundError("Project not found.");

    // Return the project
    // res.status(200).json(project);
    next(
      new SuccessResponse(200, "Successfully fetched the project.", {
        project,
      })
    );
  } catch (err: any) {
    next(err);
  }
};

// Edit a project
export const editProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

    next(
      new SuccessResponse(200, "Project updated successfully.", {
        updatedProject,
      })
    );
  } catch (err: any) {
    next(err);
  }
};

// Create a new project for sharing
export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

    // Check if the project was saved
    if (!savedProject) throw new ConflictError("Project could not be saved.");

    // Insert the project ID into the user's ownedProjects array
    await User.findByIdAndUpdate(userId, {
      $push: {
        ownedProjects: savedProject._id,
      },
    });

    // Send the response back using format
    next(
      new SuccessResponse(201, "Project saved successfully.", {
        createdProject: savedProject,
      })
    );
  } catch (err: any) {
    next(err);
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
export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) throw new NotFoundError("Project not found.");

    // Send the response back using format
    next(
      new SuccessResponse(200, "Project deleted successfully.", {
        deletedProjectId: project._id,
      })
    );
  } catch (error: any) {
    next(error);
  }
};

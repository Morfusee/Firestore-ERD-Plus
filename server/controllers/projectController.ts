import { NextFunction, Request, Response } from "express";
import Project from "../models/projectModel.ts";
import { decrypt, encrypt } from "@root/utils/encryption.ts";
import NotFoundError from "@root/errors/NotFoundError.ts";
import mongoose from "mongoose";
import ConflictError from "@root/errors/ConflictError.ts";
import User from "@root/models/userModel.ts";
import SuccessResponse from "@root/success/SuccessResponse.ts";
import CreatedResponse from "@root/success/CreatedResponse.ts";
import Changelog from "@root/models/changelogModel.ts";
import { ValidatedRoleRequest } from "@root/types/authTypes.ts";

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
    }).select('-data -members');

    if (!projectsByUser) throw new NotFoundError("No projects found.");

    // Send templated response
    next(
      new SuccessResponse("Projects successfully fetched.", {
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
    const projects = await Project.find().select('-data -members');

    // If no projects are found, throw an error
    if (!projects || projects.length === 0)
      throw new NotFoundError("No projects found.");

    // Return the projects
    next(
      new SuccessResponse("Successfully fetched all projects.", {
        projects,
      })
    );
  } catch (err: any) {
    next(err);
  }
};

// Get a project by ID
export const getProjectById = async (
  req: ValidatedRoleRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId

    // Find the project by ID
    const project = await Project.findById(req.params.projectId);

    // Check if the project exists
    if (!project) throw new NotFoundError("Project not found.");

    const member = project.members.find((user) => user.userId.toString() === userId)
    const userRole = member ? member.role : null

    const { members, ...projectData} = project.toJSON()

    next(
      new SuccessResponse("Successfully fetched the project.", {
        project: projectData,
        userRole
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
    const project = await Project.findById(req.params.projectId);

    // Check if the project exists
    if (!project) throw new NotFoundError("Project not found.");

    // Update the project
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.projectId,
      req.body,
      { new: true }
    ).select('-data -members');

    next(
      new SuccessResponse("Project updated successfully.", {
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
          role: "Owner",
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
      new CreatedResponse("Project saved successfully.", {
        createdProject: savedProject,
      })
    );
  } catch (err: any) {
    next(err);
  }
};

// Save data to a project
export const saveProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Find the project by ID
    const project = await Project.findById(req.params.projectId).select('-members');
    const { data, members = [] } = req.body;

    // Check if the project exists
    if (!project) throw new ConflictError("Project does not exist.");

    project.data = req.body.data;

    // Save the project
    const savedProject = await project.save();

    // Create a new Changelog entry
    const newChangelog = new Changelog({
      project: project._id,
      data,
      currentVersion: true,
      members,
    });

    await newChangelog.save();

    const changelog = await newChangelog
      .populate({
        path: 'members',
        select: '_id displayName'
      })

    const transformedChangelog = {
      ...changelog.toObject(),
      id: changelog.id,
      members: changelog.members.map((member: any) => ({
        id: member._id,
        displayName: member.displayName,
      })),
    };

    next(
      new SuccessResponse("Project data saved successfully.", {
        project: savedProject,
        changelog: transformedChangelog,
      })
    );
  } catch (error: any) {
    next(error)
  }
};

// Delete a project
export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.projectId);

    if (!project) throw new NotFoundError("Project not found.");

    // Send the response back using format
    next(
      new SuccessResponse("Project deleted successfully.", {
        deletedProjectId: project._id,
      })
    );
  } catch (error: any) {
    next(error);
  }
};

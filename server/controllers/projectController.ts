import { Request, Response } from "express";
import Project from "../models/projectModel.ts";
import { decrypt, encrypt } from "@root/utils/encryption.ts";

// Get all projects
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const projects = await Project.find();
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
    const project = await Project.findById(req.params.id);
    if (project) {
      res.status(200).json(project);
    } else {
      res.status(404).json({
        message: "Project not found",
      });
    }
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

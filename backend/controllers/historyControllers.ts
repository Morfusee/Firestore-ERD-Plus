import { NextFunction, Request, Response } from "express";
import { History, Version } from "../models/historyModel.ts";
import Project from "../models/projectModel.ts";
import NotFoundError from "@root/errors/NotFoundError.ts";
import SucessResponse from "@root/success/SuccessResponse.ts";
import ValidationError from "@root/errors/ValidationError.ts";
import ConflictError from "@root/errors/ConflictError.ts";
import CreatedResponse from "@root/success/CreatedResponse.ts";

// Get all project versions
export const getAllProjectVersions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;

    // Validate project existence
    const project = await Project.findById(projectId);
    if (!project) throw new NotFoundError("Project not found.")

    // Fetch versions for the project
    const versions = await Version.find({ project: projectId }).populate(
      "project"
    );

    next(
      new SucessResponse("Versions fetched successfully.", {
        versions,
      })
    )

  } catch (err: any) {
    next(err)
  }
};

//Create project version
export const createProjectVersion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;
    const { name, description } = req.body;

    if (!name) throw new ValidationError("Version name is required. Example: 1.0 or Dev Branch.")

    // Check if version already exists for this project
    const existingVersion = await Version.findOne({
      project: projectId,
      version: name,
    });

    if (existingVersion) throw new ConflictError("Version with this name already exists for this project.")

    const newVersion = await Version.create({
      project: projectId,
      name,
      description,
    });

    next(
      new CreatedResponse("Versions created successfully.", {
        createdVersion: newVersion,
      })
    )
  } catch (err: any) {
    next(err)
  }
};

// Get a project version by ID
export const getVersionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId, versionId } = req.params;

    // Validate version existence
    const version = await Version.findOne({
      _id: versionId,
      project: projectId,
    }).populate("project");
    if (!version) throw new NotFoundError("Version not found.")

    next(
      new SucessResponse("Versions created successfully.", {
        version,
      })
    )
  } catch (err: any) {
    next(err)
  }
};

// Edit a project version
interface EditProjectVersionBody {
  name?: string;
  description?: string;
}

export const editProjectVersion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { versionId } = req.params;
    const { name, description } = req.body;

    if (!versionId) throw new ValidationError("Version ID is required.")

    const updates: Partial<EditProjectVersionBody> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    const updatedVersion = await Version.findByIdAndUpdate(versionId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedVersion) throw new NotFoundError("Version not found.")

    next(
      new SucessResponse("Versions updated successfully.", {
        updatedVersion,
      })
    )
  } catch (err: any) {
    next(err)
  }
};

// Delete a project version
export const deleteProjectVersion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { versionId } = req.params;

    const deletedVersion = await Version.findByIdAndDelete(versionId);
    if (!deletedVersion) throw new NotFoundError("Version not found.")

    next(
      new SucessResponse("Versions deleted successfully.", {
        deletedVersionId: deletedVersion,
      })
    )
  } catch (err: any) {
    next(err)
  }
};

// Get a version's history
export const getVersionHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { versionId } = req.params;

    // Validate version existence
    const version = await Version.findById(versionId);
    if (!version) throw new NotFoundError("Version not found.")

    // Fetch history entries for the version
    const histories = await History.find({ version: versionId }).populate(
      "version"
    );

    next(
      new SucessResponse("History entries fetched successfully.", {
        histories,
      })
    )
  } catch (err: any) {
    next(err)
  }
};

// Create a history entry
export const createVersionHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { versionId } = req.params;
    const { data, members } = req.body;

    if (!data) throw new ValidationError("Data is required.")

    const newHistory = await History.create({
      version: versionId,
      data,
      members,
      isRollback: false,
    });

    const updatedVersion = await Version.findByIdAndUpdate(
      versionId,
      {
        currentHistory: newHistory.id,
      },
      {
        new: true,
      }
    );

    if (!updatedVersion) throw new NotFoundError("Version not found.")

    next(
      new CreatedResponse("History entry created successfully.", {
        createdHistory: newHistory,
      })
    )
  } catch (err: any) {
    next(err)
  }
};

// Get a history entry
export const getHistoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { versionId, historyId } = req.params;

    // Validate history existence
    const history = await History.findOne({
      _id: historyId,
      version: versionId,
    }).populate("version");
    if (!history) throw new NotFoundError("History entry not found.")

    next(
      new SucessResponse("History entry fetched successfully.", {
        history,
      })
    )
  } catch (err: any) {
    next(err)
  }
};

// Edit a history entry
interface EditVersionHistoryBody {
  data?: string;
  members?: string[];
}

export const editVersionHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { historyId } = req.params;
    const { data, members } = req.body;

    if (!historyId) throw new ValidationError("History ID is required.")

    const updates: Partial<EditVersionHistoryBody> = {};
    if (data !== undefined) updates.data = data;
    if (members !== undefined) updates.members = members;

    const updatedHistory = await History.findByIdAndUpdate(historyId, updates, {
      new: true,
    });

    if (!updatedHistory) throw new NotFoundError("History entry not found.")

    next(
      new SucessResponse("History entry updated successfully.", {
        updatedHistory,
      })
    )
  } catch (err: any) {
    next(err)
  }
};

// Delete a history entry
export const deleteVersionHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { historyId } = req.params;

    if (!historyId) throw new ValidationError("History ID is required.")

    const historyToDelete = await History.findById(historyId);

    if (!historyToDelete) throw new NotFoundError("History entry not found.")

    const deleteMessage = await deleteHistoriesAfter(historyId);

    await History.findByIdAndDelete(historyId);

    next(
      new SucessResponse("History entry deleted successfully.", {
        deletedHistory: deleteMessage,
      })
    )
  } catch (err: any) {
    next(err)
  }
};

// Delete all history entries after a specific history
const deleteHistoriesAfter = async (historyId: string): Promise<string> => {
  const referenceHistory = await History.findById(historyId);

  if (referenceHistory) {
    const deletedHistories = await History.deleteMany({
      version: referenceHistory.version,
      createdAt: { $gt: referenceHistory.createdAt },
    });

    return `${deletedHistories.deletedCount} histories deleted.`;
  } else {
    throw new NotFoundError("Reference history entry not found.");
  }
};

// Rollback a version
export const rollbackVersionToHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { versionId, historyId } = req.params;

  try {
    // Find the history entry by ID
    const originalHistory = await History.findById(historyId);
    if (originalHistory) {
      // Create a new history entry based on the original one
      const rollbackEntry = await History.create({
        version: versionId,
        data: originalHistory.data,
        members: originalHistory.members,
        isRollback: true,
      });

      const updatedVersion = await Version.findByIdAndUpdate(
        versionId,
        { currentHistory: rollbackEntry._id },
        { new: true }
      );

      if (!updatedVersion) throw new NotFoundError("Version not found.")
      
      next(
        new SucessResponse("Version rolled back successfully.", {
          version: updatedVersion,
          rollbackEntry: rollbackEntry,
        })
      )
    } else {
      throw new NotFoundError("History entry not found")
    }

    // Update the version's current history reference
  } catch (error: any) {
    next(error)
  }
};

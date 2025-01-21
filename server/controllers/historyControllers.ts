import { Request, Response } from "express";
import { History, Version } from "../models/historyModel.ts";
import Project from "../models/projectModel.ts";

// Get all project versions
export const getAllProjectVersions = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    // Validate project existence
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
    }

    // Fetch versions for the project
    const versions = await Version.find({ project: projectId }).populate(
      "project"
    );
    res.status(200).json(versions);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

//Create project version
export const createProjectVersion = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Version name is required. Example: 1.0 or Dev Branch",
      });
    }

    // Check if version already exists for this project
    const existingVersion = await Version.findOne({
      project: projectId,
      version: name,
    });

    if (existingVersion) {
      return res.status(409).json({
        message: "Version with this name already exists for this project.",
      });
    }

    const newVersion = await Version.create({
      project: projectId,
      name,
      description,
    });

    return res.status(201).json(newVersion);
  } catch (err: any) {
    return res.status(500).json({
      message: "Failed to create version",
      error: err.message,
    });
  }
};

// Get a project version by ID
export const getVersionById = async (req: Request, res: Response) => {
  try {
    const { projectId, versionId } = req.params;

    // Validate version existence
    const version = await Version.findOne({
      _id: versionId,
      project: projectId,
    }).populate("project");
    if (!version) {
      res.status(404).json({ message: "Version not found" });
    }

    res.status(200).json(version);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Edit a project version
interface EditProjectVersionBody {
  name?: string;
  description?: string;
}

export const editProjectVersion = async (req: Request, res: Response) => {
  try {
    const { versionId } = req.params;
    const { name, description } = req.body;

    if (!versionId) {
      return res.status(400).json({ message: "Version ID is required." });
    }

    const updates: Partial<EditProjectVersionBody> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    const updatedVersion = await Version.findByIdAndUpdate(versionId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedVersion) {
      return res.status(404).json({ message: "Version not found." });
    }

    return res.status(200).json(updatedVersion);
  } catch (err: any) {
    return res.status(500).json({
      message: err instanceof Error ? err.message : "An error occurred.",
    });
  }
};

// Delete a project version
export const deleteProjectVersion = async (req: Request, res: Response) => {
  try {
    const { versionId } = req.params;

    const deletedVersion = await Version.findByIdAndDelete(versionId);
    if (!deletedVersion) {
      return res.status(404).json({ message: "Version not found." });
    }

    return res.status(200).json({ message: "Version deleted successfully." });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// Get a version's history
export const getVersionHistory = async (req: Request, res: Response) => {
  try {
    const { versionId } = req.params;

    // Validate version existence
    const version = await Version.findById(versionId);
    if (!version) {
      res.status(404).json({ message: "Version not found" });
    }

    // Fetch history entries for the version
    const histories = await History.find({ version: versionId }).populate(
      "version"
    );
    res.status(200).json(histories);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Create a history entry
export const createVersionHistory = async (req: Request, res: Response) => {
  try {
    const { versionId } = req.params;
    const { data, members } = req.body;

    if (!data) {
      return res.status(400).json({ message: "Data is required." });
    }

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

    if (!updatedVersion) {
      return res.status(404).json({ message: "Version not found." });
    }

    return res.status(201).json(newHistory);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// Get a history entry
export const getHistoryById = async (req: Request, res: Response) => {
  try {
    const { versionId, historyId } = req.params;

    // Validate history existence
    const history = await History.findOne({
      _id: historyId,
      version: versionId,
    }).populate("version");
    if (!history) {
      res.status(404).json({ message: "History entry not found" });
    }

    res.status(200).json(history);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Edit a history entry
interface EditVersionHistoryBody {
  data?: string;
  members?: string[];
}

export const editVersionHistory = async (req: Request, res: Response) => {
  try {
    const { historyId } = req.params;
    const { data, members } = req.body;

    if (!historyId) {
      return res.status(400).json({ message: "History ID is required." });
    }

    const updates: Partial<EditVersionHistoryBody> = {};
    if (data !== undefined) updates.data = data;
    if (members !== undefined) updates.members = members;

    const updatedHistory = await History.findByIdAndUpdate(historyId, updates, {
      new: true,
    });

    if (!updatedHistory) {
      return res.status(404).json({ message: "History entry not found." });
    }

    return res.status(200).json(updatedHistory);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Delete a history entry
export const deleteVersionHistory = async (req: Request, res: Response) => {
  try {
    const { historyId } = req.params;

    if (!historyId) {
      return res.status(400).json({ message: "History ID is required." });
    }

    const historyToDelete = await History.findById(historyId);

    if (!historyToDelete) {
      return res.status(404).json({ message: "History entry not found." });
    }

    await deleteHistoriesAfter(req, res, historyId);

    await History.findByIdAndDelete(historyId);

    return res
      .status(200)
      .json({ message: "History entry deleted successfully." });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// Delete all history entries after a specific history
export const deleteHistoriesAfter = async (req: Request, res: Response) => {
  try {
    const { historyId } = req.params;

    if (!historyId) {
      return res.status(400).json({ message: "History ID is required." });
    }

    const referenceHistory = await History.findById(historyId);
    if (!referenceHistory) {
      return res
        .status(404)
        .json({ message: "Reference history entry not found." });
    }

    const deletedHistories = await History.deleteMany({
      version: referenceHistory.version,
      createdAt: { $gt: referenceHistory.createdAt },
    });

    return res.status(200).json({
      message: `${deletedHistories.deletedCount} histories deleted.`,
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// Rollback a version
export const rollbackVersionToHistory = async (req: Request, res: Response) => {
  const { versionId, historyId } = req.params;

  try {
    // Find the history entry by ID
    const originalHistory = await History.findById(historyId);
    if (!originalHistory) {
      return res.status(404).json({ message: "History entry not found." });
    }

    // Create a new history entry based on the original one
    const rollbackEntry = await History.create({
      version: versionId,
      data: originalHistory.data,
      members: originalHistory.members,
      isRollback: true,
    });

    // Update the version's current history reference
    const updatedVersion = await Version.findByIdAndUpdate(
      versionId,
      { currentHistory: rollbackEntry._id },
      { new: true }
    );

    if (!updatedVersion) {
      return res.status(404).json({ message: "Version not found." });
    }

    return res.status(200).json({
      message: "Version rolled back successfully.",
      version: updatedVersion,
      rollbackEntry,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error during rollback: " + error.message,
    });
  }
};

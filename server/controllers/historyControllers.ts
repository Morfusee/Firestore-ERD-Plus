import { Request, Response } from "express";
import { History, Version } from "../models/historyModel.ts";
import Project from "../models/projectModel.ts";

// Get all project versions
export const getAllProjectVersions = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;

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

// Get a project version by ID
export const getVersionById = async (req: Request, res: Response) => {
  try {
    const { id: projectId, versionId } = req.params;

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

//Create project version
export const createProjectVersion = async (req: Request, res: Response) => {
  try {
    const { id: projectId } = req.params;
    const { version, description } = req.body;

    if (!version) {
      return res.status(400).json({ message: "Version is required." });
    }

    // Check if version already exists for this project
    const existingVersion = await Version.findOne({
      project: projectId,
      version: version,
    });

    if (existingVersion) {
      return res.status(409).json({
        message: "Version already exists for this project.",
      });
    }

    const newVersion = await Version.create({
      project: projectId,
      version,
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

interface EditProjectVersionBody {
  name?: string;
  description?: string;
}

// Edit a project version
export const editProjectVersion = async (req: Request, res: Response) => {
  try {
    const { version } = req.params;
    const { name, description } = req.body;

    const versionId = version;

    if (!versionId) {
      res.status(400).json({ message: "Version ID is required." });
    }

    const updates: Partial<EditProjectVersionBody> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    const updatedVersion = await Version.findByIdAndUpdate(versionId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedVersion) {
      res.status(404).json({ message: "Version not found." });
    }

    res.status(200).json(updatedVersion);
  } catch (err: any) {
    res.status(500).json({
      message: err instanceof Error ? err.message : "An error occurred.",
    });
  }
};

// DeleteProjectVersion
export const deleteProjectVersion = async (req: Request, res: Response) => {
  try {
    const { version } = req.params;

    const versionId = version;

    const deletedVersion = await Version.findByIdAndDelete(versionId);
    if (!deletedVersion) {
      res.status(404).json({ message: "Version not found." });
    }

    res.status(200).json({ message: "Version deleted successfully." });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Create Version History
export const createVersionHistory = async (req: Request, res: Response) => {
  try {
    const { version, data, members, changeType } = req.body;

    if (!data) {
      res.status(400).json({ message: "Data is required." });
    }

    const newHistory = await History.create({
      version: version,
      data,
      members,
      changeType,
    });

    const versionId = version;

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
      res.status(404).json({ message: "Version not found." });
    }

    res.status(201).json(newHistory);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

interface EditVersionHistoryBody {
  data?: string;
  members?: string[];
}

// Edit Version History
export const editVersionHistory = async (req: Request, res: Response) => {
  try {
    const { _id, data, members } = req.body;

    const historyId = _id;

    if (!historyId) {
      res.status(400).json({ message: "History ID is required." });
    }

    const updates: Partial<EditVersionHistoryBody> = {};
    if (data) updates.data = data;
    if (members) updates.members = members;

    const updatedHistory = await History.findByIdAndUpdate(historyId, updates, {
      new: true,
    });
    if (!updatedHistory) {
      res.status(404).json({ message: "History entry not found." });
    }

    res.status(200).json(updatedHistory);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Delete Version History
export const deleteVersionHistory = async (req: Request, res: Response) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      res.status(400).json({ message: "History ID is required." });
      return;
    }

    const historyId = _id;

    const historyToDelete = await History.findById(historyId);

    if (!historyToDelete) {
      res.status(404).json({ message: "History entry not found." });
      return;
    }

    await deleteHistoriesAfter(req, res, historyId);

    const deletedHistory = await History.findByIdAndDelete(historyId);
    if (!deletedHistory) {
      res.status(404).json({ message: "History entry not found." });
      return;
    }

    res.status(200).json({ message: "History entry deleted successfully." });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Histories After a Specific History
export const deleteHistoriesAfter = async (
  req: Request,
  res: Response,
  historyId: string
) => {
  try {
    if (!historyId) {
      res.status(400).json({ message: "History ID is required." });
      return;
    }

    const referenceHistory = await History.findById(historyId);
    if (!referenceHistory) {
      res.status(404).json({ message: "Reference history entry not found." });
      return;
    }

    const deletedHistories = await History.deleteMany({
      version: referenceHistory.version,
      createdAt: { $gt: referenceHistory.createdAt },
    });

    res
      .status(200)
      .json({ message: `${deletedHistories.deletedCount} histories deleted.` });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

//Rollback to a specific history
export const rollbackVersionToHistory = async (req: Request, res: Response) => {
  const { versionId, historyId } = req.params;

  try {
    // Find the history entry by ID
    const originalHistory = await History.findById(historyId);
    if (!originalHistory) {
      return res.status(404).json({ message: "History entry not found." });
    }

    // Duplicate the history data (omit auto-generated fields)
    const { _id, createdAt, updatedAt, ...historyData } =
      originalHistory.toObject();

    // Create a new history entry with the duplicated data
    const rollbackEntry = await History.create({
      ...historyData,
      changeType: "ROLLBACK", // Override changeType for rollback
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

    res.status(200).json({
      message: "Version rolled back successfully.",
      version: updatedVersion,
      rollbackEntry,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error during rollback: " + error.message,
    });
  }
};

import Changelog from "@root/models/changelogModel";
import NotFoundError from "@root/errors/NotFoundError"
import { NextFunction, Request, Response } from "express"
import SuccessResponse from "@root/success/SuccessResponse.ts";

// Get All Changelogs (Excluding the `data` Field)
export const getChangelogsByProjectId = async (
  req: Request, 
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;

    const changelogs = await Changelog.find({ project: projectId })
      .select('-data') // Exclude the `data` field
      .sort({ createdAt: -1 }); // Optional: Sort by creation date (newest first)

    next(
      new SuccessResponse("Changelogs fetched successfully.", {
        changelogs
      })
    )
  } catch (error) {
    next(error)
  }
};

// Get Single Changelog (Includes the `data` Field)
export const getChangelogById = async (
  req: Request, 
  res: Response,
  next: NextFunction
) => {
  try {
    const { changelogId } = req.params;

    const changelog = await Changelog.findById(changelogId);

    if (!changelog) throw new NotFoundError("Changelog not found.")

    next(
      new SuccessResponse("Changelogs fetched successfully.", {
        changelog
      })
    )
  } catch (error) {
    next(error)
  }
};
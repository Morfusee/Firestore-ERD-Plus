import Changelog from "@root/models/changelogModel";
import NotFoundError from "@root/errors/NotFoundError"
import { NextFunction, Request, Response } from "express"
import SuccessResponse from "@root/success/SuccessResponse.ts";

// Get All Changelogs
export const getChangelogsByProjectId = async (
  req: Request, 
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;

    const changelogs = await Changelog.find({ project: projectId })
      .select('-data')
      .sort({ createdAt: -1 })
      .populate({
        path: 'members',
        select: '_id displayName'
      })

    next(
      new SuccessResponse("Changelogs fetched successfully.", {
        changelogs
      })
    )
  } catch (error) {
    next(error)
  }
};

// Get Single Changelog
export const getChangelogById = async (
  req: Request, 
  res: Response,
  next: NextFunction
) => {
  try {
    const { changelogId } = req.params;

    const changelog = await Changelog.findById(changelogId)
      .populate({
        path: 'members',
        select: '_id displayName'
      });

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
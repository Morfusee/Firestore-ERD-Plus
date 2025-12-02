import { NextFunction, Request, Response } from "express";
import Settings from "../models/settingsModel.ts";
import NotFoundError from "@root/errors/NotFoundError.ts";
import SuccessResponse from "@root/success/SuccessResponse.ts";
import User from "@root/models/userModel.ts";
import CreatedResponse from "@root/success/CreatedResponse.ts";
import BadRequestError from "@root/errors/BadRequestError.ts";

/**
 * Retrieve user settings by user ID.
 */
export const getSettingsByUserId = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
  try {

    const user = await User.findById(req.params.userId)
    if (!user) throw new NotFoundError("User not found.");

    // Find settings by user ID
    const settings = await Settings.findOne({ user: req.params.userId });

    if (!settings) throw new NotFoundError("Settings data not found.");

    next(
      new SuccessResponse("Settings fetched successfully.", {
        settings,
      })
    );
  } catch (err: any) {
    // Return 500 if an error occurs
    next(err)
  }
};

// Create user settings
export const createSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
    if (!user) throw new NotFoundError("User not found.");

    const createdSettings = await Settings.create({ ...req.body, user: userId });
    if (!createdSettings) throw new BadRequestError("Error creating user settings.");

    next(
      new CreatedResponse("Settings created successfully.", {
        createdSettings,
      })
    )
  } catch (err: any) {
    next(err)
  }
};

/**
 * Update user settings by user ID.
 */
export const updateSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId)
    if (!user) throw new NotFoundError("User not found.");

    // Update settings for the specified user ID
    const updatedSettings = await Settings.findOneAndUpdate(
      { user: userId },
      req.body,
      { new: true }
    );
    if (!updatedSettings) throw new NotFoundError("Settings not found.");

    next(
      new SuccessResponse("Settings updated successfully.", {
        updatedSettings,
      })
    )

  } catch (err: any) {
    // Return 500 if an error occurs
    next(err)
  }
};

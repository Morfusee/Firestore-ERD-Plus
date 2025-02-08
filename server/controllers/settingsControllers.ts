import { Request, Response } from "express";
import Settings from "../models/settingsModel.ts";

/**
 * Retrieve user settings by user ID.
 */
export const getSettingsByUserId = async (req: Request, res: Response) => {
  try {
    // Find settings by user ID
    const settings = await Settings.findOne({ user: req.params.userId });
    if (settings) {
      // Return settings if found
      res.status(200).json(settings);
    } else {
      // Return 404 if settings are not found
      res.status(404).json({
        message: "Settings data not found",
      });
    }
  } catch (err: any) {
    // Return 500 if an error occurs
    res.status(500).json({
      message: err.message,
    });
  }
};

// Create user settings
export const createSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const newSettings = await Settings.create({ ...req.body, user: userId });
    res.status(201).json(newSettings);
  } catch (err: any) {
    res.status(500).json({
      message: err.message,
    });
  }
};

/**
 * Update user settings by user ID.
 */
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    // Update settings for the specified user ID
    const updatedSettings = await Settings.findOneAndUpdate(
      { user: userId },
      req.body,
      { new: true }
    );
    if (updatedSettings) {
      // Return updated settings if successful
      res.status(200).json(updatedSettings);
    } else {
      // Return 404 if settings are not found
      res.status(404).json({
        message: "Settings data not found",
      });
    }
  } catch (err: any) {
    // Return 500 if an error occurs
    res.status(500).json({
      message: err.message,
    });
  }
};

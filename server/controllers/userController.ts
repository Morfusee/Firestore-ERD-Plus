import User from "../models/userModel.js";
import { Request, Response } from "express";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, displayName } = req.body;

    const newUser = new User({
      username,
      email,
      displayName: displayName || username,
    });

    await newUser.save();

    res.status(201).json(newUser);
  } catch (err: any) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
    }

    if (
      Object.keys(req.body).length === 0 ||
      Object.values(req.body).some((value) => value === "")
    ) {
      res.status(400).json({
        message: "Request body is empty or contains empty value.",
      });

      return;
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json({
      message: "User updated successfully",
      updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getUserByEmail = async (req: Request, res: Response) => {
  try {
    const { email, limit } = req.query;

    const limitNumber = limit ? parseInt(limit as string, 10) : 10; // Default to 10 if no limit is provided

    // Validate the limit to ensure it's a number
    if (isNaN(limitNumber) || limitNumber <= 0) {
      return res.status(400).json({ message: "Invalid limit value." });
    }

    const users = await User.find({
      email: { $regex: email, $options: "i" },
    }).limit(limitNumber);

    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({
      error: error.message,
    });
  }
};

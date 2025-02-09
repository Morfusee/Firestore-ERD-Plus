import SuccessResponse from "@root/success/SuccessResponse.ts";
import User from "../models/userModel.ts";
import { NextFunction, Request, Response } from "express";
import NotFoundError from "@root/errors/NotFoundError.ts";
import ValidationError from "@root/errors/ValidationError.ts";
import CreatedResponse from "@root/success/CreatedResponse.ts";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find();

    next(
      new SuccessResponse("Users fetched successfully.", {
        users,
      })
    );
  } catch (error: any) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      next(
        new SuccessResponse("User fetched successfully.", {
          user,
        })
      );
    } else {
      throw new NotFoundError("User not found.");
    }
  } catch (error: any) {
    next(error);
  }
};

// Get all projects by user ID
export const getOwnedProjectsByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id)
    if (!user) throw new NotFoundError("User not found.");

    const ownedProjectsByUser = await User.findOne({
      _id: id,
    })
      .populate({
        path: "ownedProjects",
        select: "-data -members"
      }) // Populate all the found ids with data
      .then((user) => user?.ownedProjects); // Get the ownedProjects field only

    if (!ownedProjectsByUser) {
      throw new NotFoundError("No projects found.");
    }

    // Send templated response
    next(
      new SuccessResponse("Projects successfully fetched.", {
        projects: ownedProjectsByUser,
      })
    );
  } catch (error: any) {
    next(error);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, displayName } = req.body;

    const newUser = new User({
      username,
      email,
      displayName: displayName || username,
    });

    await newUser.save();

    next(
      new CreatedResponse("User created successfully.", {
        createdUser: newUser,
      })
    );
  } catch (err: any) {
    next(err);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new NotFoundError("User not found.");
    }

    if (
      Object.keys(req.body).length === 0 ||
      Object.values(req.body).some((value) => value === "")
    ) {

      throw new ValidationError("Request body is empty or contains empty value.")

    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    next(
      new SuccessResponse("User updated successfully.", {
        updatedUser,
      })
    );
  } catch (error: any) {
    next(error);
  }
};

export const getUserByEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, limit } = req.query;

    const limitNumber = Number(limit) || 10; // Default to 10 if no limit is provided


    const users = await User.find({
      email: { $regex: email, $options: "i" },
    }).limit(limitNumber);

    next(
      new SuccessResponse("Users fetched successfully.", {
        users,
      })
    );
  } catch (error: any) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Find the user by ID and delete
    const user = await User.findByIdAndDelete(req.params.id);

    // Check if user exists
    if (!user) {
      throw new NotFoundError("User not found.");
    }

    // Send success response
    next(
      new SuccessResponse("User deleted successfully.", {
        deleteUser: user,
      })
    );
  } catch (error: any) {
    next(error);
  }
};

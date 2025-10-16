import { bucket, getAuth } from "@root/config/firebase";
import NotFoundError from "@root/errors/NotFoundError.ts";
import ValidationError from "@root/errors/ValidationError.ts";
import CreatedResponse from "@root/success/CreatedResponse.ts";
import SuccessResponse from "@root/success/SuccessResponse.ts";
import { NextFunction, Request, Response } from "express";
import User from "../models/userModel.ts";
import { sendEmailNotification } from "@root/service/emailService/mailer.ts";
import { accountDeletedEmail } from "@root/service/emailService/emailTemplates.ts";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find().select("-email");

    if (!users) {
      throw new NotFoundError("No users found.");
    }

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

    const user = await User.findById(id);
    if (!user) throw new NotFoundError("User not found.");

    const ownedProjectsByUser = await User.findOne({
      _id: id,
    })
      .populate({
        path: "ownedProjects",
        select: "-data -members",
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
      throw new ValidationError(
        "Request body is empty or contains empty value."
      );
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

export const getUserByUsername = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, limit, excludedUsers } = req.body;

    // Ensure excludedUsers is an array, defaulting to an empty array if not provided
    const optionalExcludedUsers = Array.isArray(excludedUsers)
      ? excludedUsers
      : [];

    const limitNumber = Number(limit) || 5;

    const users = await User.find({
      username: {
        $regex: username,
        $options: "i",
        $nin: optionalExcludedUsers,
      },
    }).limit(limitNumber);

    next(
      new SuccessResponse("Users fetched successfully.", {
        users,
      })
    );
  } catch (error) {
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
    const user = await User.findById(req.params.id);

    // Check if user exists
    if (!user) {
      throw new NotFoundError("User not found.");
    }

    const { email: deletedUserEmail, username: deletedUsername } = user;

    // Delete profile pictrure from bucket
    if (user.profilePicture) {
      try {
        const fileName = user.profilePicture.split("/").pop()?.split("?")[0];
        if (fileName) {
          await bucket.file(`profile-pictures/${fileName}`).delete();
          console.log("Profile picture deleted:", fileName);
        }
      } catch (error) {
        console.error("Failed to delete profile picture:", error);
      }
    }

    // Delete from firebase
    await getAuth().currentUser?.delete();

    // Delete from database
    await User.findByIdAndDelete(user._id);

    await sendEmailNotification({
      to: deletedUserEmail,

      subject: `✅ Your FirestoreERD Account Has Been Deleted`,

      html: accountDeletedEmail(deletedUsername),
    });

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

export const uploadProfilePicture = async (
  req: Request & {
    file?: { originalname: string; buffer: Buffer; mimetype: string };
  },
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user exists
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new NotFoundError("User not found.");
    }

    // Check if file was uploaded
    if (!req.file) {
      throw new ValidationError("No file uploaded.");
    }

    // Delete existing profile picture from Firebase if it exists
    if (user.profilePicture) {
      try {
        const fileName = user.profilePicture.split("/").pop()?.split("?")[0];
        if (fileName) {
          await bucket.file(`profile-pictures/${fileName}`).delete();
        }
      } catch (error) {
        console.error("Error deleting old profile picture:", error);
        // Continue with upload even if delete fails
      }
    }

    // Create a unique filename
    const timestamp = Date.now();
    const fileName = `${user._id}-${timestamp}.${req.file.originalname
      .split(".")
      .pop()}`;
    const filePath = `profile-pictures/${fileName}`;

    // Create a new blob in the bucket and upload the file data
    const blob = bucket.file(filePath);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    // Handle errors during upload
    blobStream.on("error", (error: { message: any }) => {
      throw new Error(`Unable to upload image, ${error.message}`);
    });

    // Handle successful upload
    blobStream.on("finish", async () => {
      // Make the file public
      await blob.makePublic();

      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

      // Update user profile picture URL in database
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { profilePicture: publicUrl },
        { new: true }
      );

      next(
        new SuccessResponse("Profile picture uploaded successfully.", {
          user: updatedUser,
        })
      );
    });

    // Write the file to Firebase Storage
    blobStream.end(req.file.buffer);
  } catch (error: any) {
    next(error);
  }
};

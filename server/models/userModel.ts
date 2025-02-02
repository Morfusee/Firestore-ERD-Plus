import mongoose from "mongoose";
import Project from "./projectModel";

// Define type
export interface IUser {
  username: string;
  email: string;
  displayName?: string;
  token: string;
  ownedProjects: mongoose.Types.ObjectId[];
}

// Define Scehma
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    token: {
      type: String,
      default: "", // default to empty string for now
    },
    // Change this if necessary, this is just for my testing
    ownedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Project",
      },
    ],
    sharedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Project",
      },
    ]
  },
  {
    timestamps: true,
  }
);

// Cascade delete projects when a user is deleted
userSchema.pre("findOneAndDelete", async function (next) {
  try {
    // Get the document that's about to be deleted
    // Use the IUser type to have intellisense
    const doc: IUser | null = await this.model.findOne(this.getFilter());

    if (doc) {
      // Delete all projects owned by this user by 
      // looping through the ownedProjects array
      for (const projectId of doc.ownedProjects) {
        await Project.findByIdAndDelete(projectId);
      }
    }

    next();
  } catch (error: any) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new Error("Unknown error"));
    }
  }
});

//Create model
const User = mongoose.model("User", userSchema);

export default User;

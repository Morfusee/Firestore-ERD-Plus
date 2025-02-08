import mongoose from "mongoose";
import Project from "./projectModel";
import Settings from "./settingsModel";
import mongooseTransformPlugin from "@root/utils/mongooseTransformPlugin";

// Define type
export interface IUser {
  _id: mongoose.Types.ObjectId;
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
    ],
  },
  {
    timestamps: true,
  }
);

// Cascade delete projects and settings when a user is deleted
userSchema.pre("findOneAndDelete", async function (next) {
  try {
    // Get the document that's about to be deleted
    // Use the IUser type to have intellisense
    const doc: IUser | null = await this.model.findOne(this.getFilter());

    if (doc) {
      // Delete all projects owned by this user by
      await Promise.all(
        doc.ownedProjects.map((projectId) =>
          Project.findByIdAndDelete(projectId)
        )
      );

      // Delete settings associated by this user
      await Settings.findOneAndDelete({ user: doc._id });
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

// auto create settings when a user is created
userSchema.post("save", async function (doc, next) {
  try {
    await Settings.create({ user: doc._id });
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.plugin(mongooseTransformPlugin);

//Create model
const User = mongoose.model("User", userSchema);

export default User;

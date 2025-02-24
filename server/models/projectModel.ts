import mongoose from "mongoose";
import { History, Version } from "./historyModel";
import User from "./userModel";
import mongooseTransformPlugin from "@root/utils/mongooseTransformPlugin";
import Changelog from "./changelogModel";

// Define a schema
const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["Owner", "Editor", "Viewer"],
      default: "Viewer",
      required: true,
    },
  }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    icon: { type: String, required: true, trim: true },
    data: { type: String },
    members: {
      type: [memberSchema],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to cascade the deleting of projects and versions
projectSchema.pre("findOneAndDelete", async function (next) {
  try {
    // Get the document that's about to be deleted
    const doc = await this.model.findOne(this.getFilter());
    if (doc) {
      // Remove project ID from all users' ownedProjects
      await User.updateOne(
        // Find the user that has this project ID in their ownedProjects
        { ownedProjects: doc._id },
        { $pull: { ownedProjects: doc._id } }
      );

      // Find all versions associated with this project
      const versions = await Version.find({ project: doc._id });
      const versionIds = versions.map((version) => version._id);

      // Delete all associated histories
      await History.deleteMany({ version: { $in: versionIds } });

      // Delete all versions
      await Version.deleteMany({ project: doc._id });

      // Delete all changelogs
      await Changelog.deleteMany({ project: doc._id });
    }
    next();
  } catch (error) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new Error("Unknown error"));
    }
  }
});


projectSchema.plugin(mongooseTransformPlugin);

// Create a model
const Project = mongoose.model("Project", projectSchema);

export default Project;

import mongoose from "mongoose";
import { History, Version } from "./historyModel";

// Define a schema
const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    icon: { type: String, required: true, trim: true },
    data: { type: String, required: true },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        role: {
          type: String,
          enum: ['owner', 'admin', 'editor', 'viewer'],
          default: 'viewer',
          required: true,
        }
      }
    ]
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
      // Find all versions associated with this project
      const versions = await Version.find({ project: doc._id });
      const versionIds = versions.map((version) => version._id);

      // Delete all associated histories
      await History.deleteMany({ version: { $in: versionIds } });

      // Delete all versions
      await Version.deleteMany({ project: doc._id });
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

// Create a model
const Project = mongoose.model("Project", projectSchema);

export default Project;

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
    members: { type: Array, required: false },
  },
  {
    timestamps: true,
  }
);

// Middleware to cascade the deleting of projects and versions
projectSchema.pre(['findOneAndDelete', 'findByIdAndDelete'], async function(next) {
  try {
    // Get the document that's about to be deleted
    const doc = await this.model.findOne(this.getFilter());
    if (doc) {
      // Find all versions associated with this project
      const versions = await Version.find({ project: doc._id });
      const versionIds = versions.map(version => version._id);
      
      // Delete all associated histories
      await History.deleteMany({ version: { $in: versionIds } });
      
      // Delete all versions
      await Version.deleteMany({ project: doc._id });
    }
    next();
  } catch (error) {
    next(error);
  }
});


// Create a model
const Project = mongoose.model("Project", projectSchema);

export default Project;

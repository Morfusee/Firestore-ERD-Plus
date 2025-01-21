import mongoose from "mongoose";

// Define the Version schema
const versionSchema = new mongoose.Schema(
  {
    version: { type: String, required: true, trim: true }, // Example: "1.0.0"
    description: { type: String, required: false, trim: true }, // Optional metadata about the version
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    currentHistory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "History",
    }, 
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

versionSchema.index({ project: 1, version: 1 }, { unique: true });

// TODO: Change members to required: true after User is implemented
// Define the History schema
const historySchema = new mongoose.Schema(
  {
    version: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Version",
      required: true,
      index: true,
    },
    data: {
      type: String,
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
    ],
    changeType: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "ROLLBACK"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create models
const Version = mongoose.model("Version", versionSchema);
const History = mongoose.model("History", historySchema);

export { History, Version };

import mongoose from "mongoose";

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

// Create a model
const Project = mongoose.model("Project", projectSchema);

export default Project;

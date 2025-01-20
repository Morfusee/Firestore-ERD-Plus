import mongoose from "mongoose";

// Define a schema
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  data: { type: String, required: true },
  members: { type: Array, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create a model
const Project = mongoose.model("Project", projectSchema);

export default Project;

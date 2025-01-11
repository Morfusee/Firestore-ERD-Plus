import mongoose from "mongoose";

// Define a schema
const projectSchema = new mongoose.Schema({
  id: String,
  name: String,
  icon: String,
  diagramData: String,
  createdAt: Number,
  updatedAt: Number,
});

// Create a model
const Project = mongoose.model("User", projectSchema);

export default Project;

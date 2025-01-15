import mongoose from "mongoose";

// Define a schema
const projectSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  diagramData: { type: Object, required: true },
  createdAt: { type: Number, required: true },
  updatedAt: { type: Number, required: true },
});

// Create a model
const Project = mongoose.model("Project", projectSchema);

export default Project;

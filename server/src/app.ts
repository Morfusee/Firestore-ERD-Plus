import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Project from "./models/Project.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Allow frontend origin
    methods: "GET,POST,OPTIONS", // Allow methods
    allowedHeaders: "Content-Type,Authorization", // Allow headers
    credentials: true, // Allow cookies and credentials
  })
);

app.use(express.json());

app.options("*", cors()); // This will handle preflight requests for all routes

// MongoDB connection URI
const mongoURI = process.env.MONGO_URI;
// const mongoURI = "mongodb://root:root@localhost:27017";

// Connect to MongoDB
mongoose
  .connect(mongoURI!)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB: ", err);
  });

// Get all projects
// TODO: Add pagination
app.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (err: any) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Find a project by ID
app.get("/projects/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (project) {
      res.status(200).json(project);
    } else {
      res.status(404).json({
        message: "Project not found",
      });
    }
  } catch (err: any) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Create a new project for sharing
app.post("/projects/share", async (req, res) => {
  try {
    const project = new Project(req.body);
    const savedUser = await project.save();
    res.status(201).json(savedUser);
  } catch (err: any) {
    res.status(400).json({
      message: err.message,
    });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

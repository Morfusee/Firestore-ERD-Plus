import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import projectRoutes from "./routes/projectRoutes.ts";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Enable CORS
app.use(
  cors({
    origin: "http://localhost:5173", // Allow frontend origin locally
    methods: "GET,POST,OPTIONS", // Allow methods
    allowedHeaders: "Content-Type,Authorization", // Alow headers
    credentials: true, // Allow cookies and credentials
  })
);
app.use(express.json());
app.options("*", cors()); // This will handle preflight requests for all routes

// MongoDB connection URI
/* For Docker */
// const mongoURI = process.env.MONGO_DOCKER_URI;
/* For Local */
const mongoURI = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@localhost:27017/FERD`;
/* For Atlas */
// const mongoURI = process.env.MONGO_ATLAS_URI;
// Dynamic URI for Development and Production
const isDockerRunning = process.env.IS_DOCKERIZED;
// const mongoURI = isDockerRunning
//   ? process.env.MONGO_DOCKER_URI
//   : process.env.MONGO_ATLAS_URI;

// Connect to MongoDB
mongoose
  .connect(mongoURI!)
  .then(() => {
    console.log("Connected to MongoDB", isDockerRunning ? "Docker" : "Atlas");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB: ", err);
  });

app.use("/projects", projectRoutes);

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import projectRoutes from "./routes/projectRoutes.ts";
import memberRoutes from "./routes/memberRoutes.ts";
import historyRoutes from "./routes/historyRoutes.ts";
import settingsRoutes from "./routes/settingsRoutes.ts";
import userRoutes from "./routes/userRoutes.ts";
import emojiRoutes from "./routes/emojiRoutes.ts";
import changelogRoutes from "./routes/changelogRoutes.ts";
import authRoutes from "./routes/authRoutes.ts";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { responseStatusMiddleware } from "./middleware/responseStatusMiddleware.ts";

dotenv.config();

const app = express();

// Enable CORS
app.use(
  cors({
    origin: "http://localhost:5173", // Allow frontend origin locally
    methods: "GET,POST,DELETE,PATCH,OPTIONS", // Allow methods
    credentials: true, // Allow cookies and credentials
  })
);
app.use(express.json());
app.use(cookieParser());
app.options("*", cors()); // This will handle preflight requests for all routes

// MongoDB connection URI
/* For Docker */
// const mongoURI = process.env.MONGO_DOCKER_URI;
/* For Local */
// const mongoURI = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@localhost:27017/FERD`;
/* For Atlas */
// const mongoURI = process.env.MONGO_ATLAS_URI;
// Dynamic URI for Development and Production
if (process.env.NODE_ENV !== "test") {
  const isDockerRunning = process.env.IS_DOCKERIZED;
  const mongoURI = isDockerRunning
    ? process.env.MONGO_DOCKER_URI
    : process.env.MONGO_ATLAS_URI;

  // Connect to MongoDB
  mongoose
    .connect(mongoURI!)
    .then(() => {
      console.log("Connected to MongoDB", isDockerRunning ? "Docker" : "Atlas");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB: ", err);
    });
}

// Use project routes
app.use(
  "/projects",
  projectRoutes,
  historyRoutes,
  memberRoutes,
  changelogRoutes
);

// Use user routes
app.use("/users", userRoutes, settingsRoutes);

// GitHub Emoji API
app.use("/emojis", emojiRoutes);

// Firebase Auth routes
app.use("/auth", authRoutes);

app.use(responseStatusMiddleware);

export default app;

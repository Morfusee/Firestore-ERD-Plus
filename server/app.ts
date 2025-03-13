import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import passport from "passport";
import "./config/passport.ts";
import { responseStatusMiddleware } from "./middleware/responseStatusMiddleware.ts";
import authRoutes from "./routes/authRoutes.ts";
import changelogRoutes from "./routes/changelogRoutes.ts";
import emojiRoutes from "./routes/emojiRoutes.ts";
import historyRoutes from "./routes/historyRoutes.ts";
import memberRoutes from "./routes/memberRoutes.ts";
import projectRoutes from "./routes/projectRoutes.ts";
import settingsRoutes from "./routes/settingsRoutes.ts";
import userRoutes from "./routes/userRoutes.ts";
import helmet from "helmet";

dotenv.config();

const app = express();

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: "GET,POST,DELETE,PATCH,OPTIONS",
    credentials: true,
  })
);

// Apply helmet middleware
app.use(
  helmet({
    frameguard: {
      action: "deny",
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    permittedCrossDomainPolicies: {
      permittedPolicies: "none",
    },
  })
);

app.use(express.json());

// Cookie parser
app.use(cookieParser());

// CORS preflight
app.options("*", cors());

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

  // Session middleware
  // This is required for passport to work
  app.use(
    session({
      secret: process.env.SESSION_KEY || "default_secret",
      resave: false,
      saveUninitialized: false,
      // Responsible for storing sessions in the database
      store: MongoStore.create({
        mongoUrl: mongoURI,
        collectionName: "sessions", // Collection to store session data
        ttl: 14 * 24 * 60 * 60, // Session expiration time (14 days)
      }),
      cookie: {
        httpOnly: true,
        // Enable this for production
        // secure: true,
        // sameSite: "none",
      },
    })
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
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

// Family Emoji API
app.use("/emojis", emojiRoutes);

// Auth routes
app.use("/auth", authRoutes);

app.use(responseStatusMiddleware);

export default app;

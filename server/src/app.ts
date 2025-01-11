import express from "express";
import mongoose from "mongoose";
import User from "./models/User.js";

const app = express();

app.use(express.json());

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

app.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).send(savedUser);
  } catch (err: any) {
    res.status(400).json({
      message: err.message,
    });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (err: any) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

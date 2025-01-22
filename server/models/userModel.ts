import mongoose from "mongoose";

// Define Scehma
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    token: {
      type: String,
      default: "", // default to empty string for now
    },
  },
  {
    timestamps: true,
  }
);

//Create model
const User = mongoose.model("User", userSchema);

export default User;

import mongoose from "mongoose";

// TODO: switch type and use reference on the commented line after User is implemented
const settingsSchema = new mongoose.Schema(
  {
    user: {
      //   type: mongoose.Schema.Types.ObjectId,
      //   ref: "User",
      type: String,
      require: true,
    },
    autoSaveInterval: {
      type: Number,
      required: false,
      default: 0,
    },
    canvasBackground: {
      type: String,
      required: false,
      enum: ["Dots", "Lines", "Cross"],
      default: "Dots",
    },
    theme: {
      type: String,
      required: false,
      enum: ["System", "Light", "Dark"],
      default: "System",
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;

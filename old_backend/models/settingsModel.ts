import mongoose from "mongoose";
import mongooseTransformPlugin from "@root/utils/mongooseTransformPlugin";

const settingsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
      enum: ["Light", "Dark"],
      default: "Light",
    },
  },
  {
    timestamps: true,
  }
);

settingsSchema.plugin(mongooseTransformPlugin);

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;

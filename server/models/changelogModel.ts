import mongoose from "mongoose";
import mongooseNestedTransformPlugin from "@root/utils/mongooseNestedTransformPlugin";

// Define the Version schema
const changelogSchema = new mongoose.Schema(
  {
    name: { type: String, required: false, trim: true },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    data: {
      type: String,
      required: true,
    },
    currentVersion: {
      type: Boolean,
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
    ],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);


changelogSchema.plugin(mongooseNestedTransformPlugin);

const Changelog = mongoose.model('Changelog', changelogSchema);
export default Changelog;

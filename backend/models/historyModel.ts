import mongoose from "mongoose";
import mongooseTransformPlugin from "@root/utils/mongooseTransformPlugin";

// Define the Version schema
const versionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // Example: "1.0.0"
    description: { type: String, required: false, trim: true }, // Optional metadata about the version
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    currentHistory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "History",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

versionSchema.index({ project: 1, version: 1 }, { unique: true });

// TODO: Change members to required: true after User is implemented
// Define the History schema
const historySchema = new mongoose.Schema(
  {
    version: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Version",
      required: true,
      index: true,
    },
    data: {
      type: String,
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
    ],
    isRollback: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// const historySchema = new mongoose.Schema(
//   {
//     version: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Version",
//       required: true,
//       index: true,
//     },
//     changes: [
//       {
//         type: {
//           data: {
//             type: String,
//             required: true,
//           },
//           changeType: {
//             type: String,
//             enum: ["CREATE", "UPDATE", "DELETE"],
//             required: true,
//           },
//         },
//         required: true,
//       },
//     ],
//     members: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: false,
//       },
//     ],
//     isRollback: {
//       type: Boolean,
//       default: false,
//     }
//   },
//   {
//     timestamps: true,
//   }
// );

// Middleware for deleteMany operations
versionSchema.pre("deleteMany", async function (next) {
  try {
    // Get the filter condition being used for deleteMany
    const filter = this.getFilter();

    // Find all versions that match the filter before they're deleted
    const versionsToDelete = await this.model.find(filter);

    // Get all version IDs
    const versionIds = versionsToDelete.map((version) => version._id);

    // Delete all histories associated with these versions
    if (versionIds.length > 0) {
      await History.deleteMany({ version: { $in: versionIds } });
    }

    next();
  } catch (error: any) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new Error("Unknown error"));
    }
  }
});

// Middleware for findByIdAndDelete operations
versionSchema.pre("findOneAndDelete", async function (next) {
  try {
    const doc = await this.model.findOne(this.getFilter());
    if (doc) {
      await History.deleteMany({ version: doc._id });
    }
    next();
  } catch (error) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new Error("Unknown error"));
    }
  }
});

versionSchema.plugin(mongooseTransformPlugin);
historySchema.plugin(mongooseTransformPlugin);

// Create models
const Version = mongoose.model("Version", versionSchema);
const History = mongoose.model("History", historySchema);

export { History, Version };

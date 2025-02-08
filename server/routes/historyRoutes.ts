import { encryptDataMiddleware } from "@root/middleware/encryptDataMiddleware";
import express from "express";
import {
  createProjectVersion,
  createVersionHistory,
  deleteProjectVersion,
  deleteVersionHistory,
  editProjectVersion,
  editVersionHistory,
  getAllProjectVersions,
  getHistoryById,
  getVersionById,
  getVersionHistory,
  rollbackVersionToHistory,
} from "../controllers/historyControllers";

const router = express.Router();

// Define routes
// Version routes
router.get("/:projectId/versions", getAllProjectVersions);
router.post("/:projectId/versions", encryptDataMiddleware, createProjectVersion);
router.get("/:projectId/versions/:versionId", getVersionById);
router.patch("/:projectId/versions/:versionId", encryptDataMiddleware, editProjectVersion);
router.delete("/:projectId/versions/:versionId", deleteProjectVersion);

// Version history routes
router.get("/:projectId/versions/:versionId/history", getVersionHistory);
router.post("/:projectId/versions/:versionId/history", encryptDataMiddleware, createVersionHistory);
router.get("/:projectId/versions/:versionId/history/:historyId", getHistoryById);
router.patch("/:projectId/versions/:versionId/history/:historyId", encryptDataMiddleware, editVersionHistory);
router.delete("/:projectId/versions/:versionId/history/:historyId", deleteVersionHistory);

// Special operations
router.post("/:projectId/versions/:versionId/history/:historyId/rollback", rollbackVersionToHistory);

export default router;

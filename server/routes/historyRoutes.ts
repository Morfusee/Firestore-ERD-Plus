import { encryptDataMiddleware } from "@root/middleware/encryptDataMiddleware";
import express from "express";
import {
  createProjectVersion,
  createVersionHistory,
  deleteHistoriesAfter,
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
router.get("/:projectId/version", getAllProjectVersions);
router.post("/:projectId/version", encryptDataMiddleware, createProjectVersion);
router.get("/:projectId/version/:versionId", getVersionById);
router.patch("/:projectId/version/:versionId", encryptDataMiddleware, editProjectVersion);
router.delete("/:projectId/version/:versionId", deleteProjectVersion);

// Version history routes
router.get("/:projectId/version/:versionId/history", getVersionHistory);
router.post("/:projectId/version/:versionId/history", encryptDataMiddleware, createVersionHistory);
router.get("/:projectId/version/:versionId/history/:historyId", getHistoryById);
router.patch("/:projectId/version/:versionId/history/:historyId", encryptDataMiddleware, editVersionHistory);
router.delete("/:projectId/version/:versionId/history/:historyId", deleteVersionHistory);

// Special operations
router.post("/:projectId/version/:versionId/history/:historyId/rollback", rollbackVersionToHistory);
router.delete("/:projectId/version/:versionId/history/:historyId/after", deleteHistoriesAfter);

export default router;

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
router.get("/:id/v", getAllProjectVersions);
router.get("/:id/v/:versionId", getVersionById);
router.get("/:id/v/:versionId/h", getVersionHistory);
router.get("/:id/v/:versionId/h/:historyId", getHistoryById);

router.post("/:id/v", encryptDataMiddleware, createProjectVersion);
router.patch("/:id/v", encryptDataMiddleware, editProjectVersion);
router.delete("/:id/v", deleteProjectVersion);

router.post("/:id/v/:versionId/h/:historyId/rb", rollbackVersionToHistory);

router.post("/:id/h", encryptDataMiddleware, createVersionHistory);
router.patch("/:id/h", encryptDataMiddleware, editVersionHistory);
router.delete("/:id/h", deleteVersionHistory);
router.delete("/:id/h/aft", deleteHistoriesAfter);

export default router;

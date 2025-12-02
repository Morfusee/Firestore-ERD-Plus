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
import {
  validateToken,
  validate,
} from "@root/middleware/validators/authValidator";

const router = express.Router();

// Define routes
// Version routes
router.get(
  "/:projectId/versions",
  [validateToken, validate],
  getAllProjectVersions
);
router.post(
  "/:projectId/versions",
  [validateToken, validate, encryptDataMiddleware],
  createProjectVersion
);
router.get(
  "/:projectId/versions/:versionId",
  [validateToken, validate],
  getVersionById
);
router.patch(
  "/:projectId/versions/:versionId",
  [validateToken, validate, encryptDataMiddleware],
  editProjectVersion
);
router.delete(
  "/:projectId/versions/:versionId",
  [validateToken, validate],
  deleteProjectVersion
);

// Version history routes
router.get(
  "/:projectId/versions/:versionId/history",
  [validateToken, validate],
  getVersionHistory
);
router.post(
  "/:projectId/versions/:versionId/history",
  [validateToken, validate, encryptDataMiddleware],
  createVersionHistory
);
router.get(
  "/:projectId/versions/:versionId/history/:historyId",
  [validateToken, validate],
  getHistoryById
);
router.patch(
  "/:projectId/versions/:versionId/history/:historyId",
  [validateToken, validate, encryptDataMiddleware],
  editVersionHistory
);
router.delete(
  "/:projectId/versions/:versionId/history/:historyId",
  [validateToken, validate],
  deleteVersionHistory
);

// Special operations
router.post(
  "/:projectId/versions/:versionId/history/:historyId/rollback",
  rollbackVersionToHistory
);

export default router;

import express from "express";
import {
  getSettingsByUserId,
  createSettings,
  updateSettings,
} from "../controllers/settingsControllers";
import { validateSettings } from "@root/middleware/validators/settingsValidator";
import { verifyToken } from "@root/middleware/validators/authValidator";

const router = express.Router();

// Define routes
router.get("/:userId/settings", [verifyToken], getSettingsByUserId);
router.post(
  "/:userId/settings",
  [verifyToken, ...validateSettings],
  createSettings
);
router.patch(
  "/:userId/settings",
  [verifyToken, ...validateSettings],
  updateSettings
);

export default router;

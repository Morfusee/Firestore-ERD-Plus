import express from "express";
import {
  getSettingsByUserId,
  createSettings,
  updateSettings,
} from "../controllers/settingsControllers";
import { validateSettings } from "@root/middleware/validators/settingsValidator";
import { validateToken, validate } from "@root/middleware/validators/authValidator";

const router = express.Router();

// Define routes
router.get("/:userId/settings", [validateToken, validate], getSettingsByUserId);
router.post(
  "/:userId/settings",
  [validateToken, ...validateSettings, validate],
  createSettings
);
router.patch(
  "/:userId/settings",
  [validateToken, ...validateSettings, validate],
  updateSettings
);

export default router;

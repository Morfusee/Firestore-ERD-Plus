import express from "express";
import {
  getSettingsByUserId,
  createSettings,
  updateSettings,
} from "../controllers/settingsControllers";
import { validateSettings } from "@root/middleware/validators/settingsValidator";

const router = express.Router();

// Define routes
router.get("/:userId/settings", getSettingsByUserId);
router.post("/:userId/settings", validateSettings, createSettings);
router.patch("/:userId/settings", validateSettings, updateSettings);

export default router;

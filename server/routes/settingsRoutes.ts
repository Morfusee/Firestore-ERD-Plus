import express from "express";
import {
  getSettingsByUserId,
  createSettings,
  updateSettings,
} from "../controllers/settingsControllers";

const router = express.Router();

// Define routes
router.get("/:userId/settings", getSettingsByUserId);
router.post("/:userId/settings", createSettings);
router.patch("/:userId/settings", updateSettings);

export default router;

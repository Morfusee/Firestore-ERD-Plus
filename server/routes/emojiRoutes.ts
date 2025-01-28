import {
  getActivitiesEmojis,
  getAllEmojis,
  getFacesEmojis,
  getNatureEmojis,
  getObjectsEmojis,
  getPlacesEmojis,
} from "@root/controllers/emojiControllers";
import express from "express";

const router = express.Router();

router.get("/", getAllEmojis);
router.get("/faces", getFacesEmojis);
router.get("/activities", getActivitiesEmojis);
router.get("/nature", getNatureEmojis);
router.get("/objects", getObjectsEmojis);
router.get("/places", getPlacesEmojis);

export default router;

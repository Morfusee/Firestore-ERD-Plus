import {
  getAllEmojis,
  getEmojis,
  getEmojisByGroup,
} from "@root/controllers/emojiControllers";
import express from "express";

const router = express.Router();

router.get("/", getEmojis);

export default router;

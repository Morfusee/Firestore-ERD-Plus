import {
  getAllEmojis,
  getEmojis,
  getEmojisByGroup,
} from "@root/controllers/emojiControllers";
import { validateToken, validate } from "@root/middleware/validators/authValidator";
import express from "express";

const router = express.Router();

router.get("/", [validateToken, validate], getEmojis);

export default router;

import ConflictError from "@root/errors/ConflictError";
import NotFoundError from "@root/errors/NotFoundError";
import { IEmoji } from "@root/types/emojiTypes";
import { NextFunction, Request, Response } from "express";

export const getEmojis = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.query.group) {
    return getEmojisByGroup(req, res, next);
  }

  return getAllEmojis(req, res, next);
};

export const getAllEmojis = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const emojis = (await fetch("https://www.emoji.family/api/emojis")
      .then((res) => res.json())
      .catch((err) => {
        throw new NotFoundError("There was an error fetching emojis.");
      })) as IEmoji[];

    if (!emojis) throw new NotFoundError("No emojis found.");

    res.status(200).json(emojis);
  } catch (error: any) {
    next(error);
  }
};

export const getEmojisByGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const group = req.query.group as string;
    const emojisByGroup = (await fetch(
      "https://www.emoji.family/api/emojis?group=" + group
    )
      .then((res) => res.json())
      .catch((err) => {
        throw new NotFoundError("There was an error fetching emojis.");
      })) as IEmoji[];

    if (!emojisByGroup) throw new NotFoundError("No emojis found.");

    res.status(200).json(emojisByGroup);
  } catch (error: any) {
    next(error);
  }
};

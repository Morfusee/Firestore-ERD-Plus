import NotFoundError from "@root/errors/NotFoundError";
import { IEmoji } from "@root/types/emojiTypes";
import { NextFunction, Request, Response } from "express";

export const getAllEmojis = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const emojis = (await fetch(
      "https://morfusee.github.io/emoji-list-api/emojis.json"
    )
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

export const getFacesEmojis = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const faceEmojis = await fetch(
      "https://morfusee.github.io/emoji-list-api/categories/faces.json"
    )
      .then((res) => res.json())
      .catch((err) => {
        throw new NotFoundError("There was an error fetching face emojis.");
      });

    if (!faceEmojis) throw new NotFoundError("No emojis found.");

    res.status(200).json(faceEmojis);
  } catch (error: any) {
    next(error);
  }
};

export const getActivitiesEmojis = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const activitiesEmojis = await fetch(
      "https://morfusee.github.io/emoji-list-api/categories/activities.json"
    )
      .then((res) => res.json())
      .catch((err) => {
        throw new NotFoundError(
          "There was an error fetching activities emojis."
        );
      });

    if (!activitiesEmojis) throw new NotFoundError("No emojis found.");

    res.status(200).json(activitiesEmojis);
  } catch (error: any) {
    next(error);
  }
};

export const getNatureEmojis = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const natureEmojis = await fetch(
      "https://morfusee.github.io/emoji-list-api/categories/nature.json"
    )
      .then((res) => res.json())
      .catch((err) => {
        throw new NotFoundError("There was an error fetching nature emojis.");
      });

    if (!natureEmojis) throw new NotFoundError("No emojis found.");

    res.status(200).json(natureEmojis);
  } catch (error: any) {
    next(error);
  }
};

export const getObjectsEmojis = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const objectsEmojis = await fetch(
      "https://morfusee.github.io/emoji-list-api/categories/objects.json"
    )
      .then((res) => res.json())
      .catch((err) => {
        throw new NotFoundError("There was an error fetching objects emojis.");
      });

    if (!objectsEmojis) throw new NotFoundError("No emojis found.");

    res.status(200).json(objectsEmojis);
  } catch (error: any) {
    next(error);
  }
};

export const getPlacesEmojis = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const objectsEmojis = await fetch(
      "https://morfusee.github.io/emoji-list-api/categories/places.json"
    )
      .then((res) => res.json())
      .catch((err) => {
        throw new NotFoundError("There was an error fetching places emojis.");
      });

    if (!objectsEmojis) throw new NotFoundError("No emojis found.");

    res.status(200).json(objectsEmojis);
  } catch (error: any) {
    next(error);
  }
};

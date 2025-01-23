import ValidationError from "@root/errors/ValidationError";
import { Response, Request, NextFunction } from "express";
import { param, validationResult } from "express-validator";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }
  next();
};

export const validateProjectId = param("id")
  .trim()
  .isMongoId()
  .withMessage("This ain't it, Chief!");



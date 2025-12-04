import ValidationError from "@root/errors/ValidationError";
import { Request, Response, NextFunction } from "express";
import { body, query, validationResult } from "express-validator";

const validate = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }
  next();
};

export const validateSettings = [
  body("autoSaveInterval")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Auto Save Interval must be a non-negative integer."),

  body("canvasBackground")
    .optional()
    .isIn(["Dots", "Lines", "Cross"])
    .withMessage("Canvas Background must be one of: Dots, Lines, or Cross."),

  body("theme")
    .optional()
    .isIn(["Light", "Dark"])
    .withMessage("Theme must be one of: System, Light, or Dark."),

  validate,
];

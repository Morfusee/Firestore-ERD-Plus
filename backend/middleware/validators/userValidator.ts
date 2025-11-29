import ValidationError from "@root/errors/ValidationError";
import { Request, Response, NextFunction } from "express";
import { body, query, validationResult } from "express-validator";

const validate = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array())
  }
  next();
};

export const validateUser = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 8, max: 20 })
    .withMessage("Username must be between 8 and 20 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers and underscore"),

  body("displayName")
    .optional()
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage("Display name must be between 8 and 20 characters"),

  validate,
]

export const validateEmailQuery = [
  query("limit")
    .optional()
    .isInt({ gt: 0})
    .withMessage("Limit must be a positive integer"),

  validate,
]

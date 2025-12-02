import ValidationError from "@root/errors/ValidationError";
import { Response, NextFunction } from "express";
import { param, validationResult } from "express-validator"

export const validate = (req: any, _res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array())
  }
  next()
}

export const validateProjectId = 
  param('projectId')
    .trim()
    .isMongoId()
    .withMessage('Invalid project id format')


export const validateChangelogId = 
  param('changelogId')
    .trim()
    .isMongoId()
    .withMessage('Invalid changelog id format')

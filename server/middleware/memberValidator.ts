import ValidationError from "@root/errors/ValidationError";
import { Response, NextFunction } from "express";
import { body, check, param, validationResult } from "express-validator"

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


export const validateUserId = 
  check('userId')
    .trim()
    .isMongoId()
    .withMessage('Invalid user id format')


export const validateRoleRequired = 
  body('role')
    .trim()
    .isIn(['admin', 'editor', 'viewer'])
    .withMessage('Invalid role')

export const validateRoleOptional = 
  body('role')
    .optional()
    .trim()
    .isIn(['admin', 'editor', 'viewer'])
    .withMessage('Invalid role')
import ValidationError from "@root/errors/ValidationError";
import { Response, Request, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";

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
  .withMessage("The project ID must be a valid MongoDB ID.");

export const validateRequestBodyNotEmpty = (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  // Check if the request body is empty or if any of the fields are empty
  if (
    Object.keys(req.body).length === 0 ||
    Object.values(req.body).some((value) => value === "")
  ) {
    throw new ValidationError([
      {
        type: "fields",
        value: req.body,
        msg: "The request body cannot be empty, and all fields must contain values.",
        param: "project",
        location: "body",
      },
    ]);
  }
  next();
};

export const validateMembersUpdateRestriction = body("members")
  .custom((value) => {
    // If the 'members' field is present in the request body, throw an error
    if (value !== undefined) {
      throw new ValidationError([
        {
          type: "fields",
          value: value,
          param: "members",
          location: "body",
        },
      ]);
    }
    return true;
  })
  .withMessage("The 'members' field cannot be modified through this endpoint.");

export const validateProjectFields = [
  // Validate the project name
  body("name").trim().notEmpty().withMessage("The project name is required."),
  // Validate the project icon
  body("icon").trim().notEmpty().withMessage("The project icon is required."),
];

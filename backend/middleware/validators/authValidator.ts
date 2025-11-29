import ValidationError from "@root/errors/ValidationError";
import { admin } from "../../config/firebase";
import { Request, Response, NextFunction } from "express";
import ConflictError from "@root/errors/ConflictError";
import dotenv from "dotenv";
import { AuthRequest } from "@root/types/authTypes";
import { validationResult } from "express-validator";
import { getFirebaseAuthErrorMessage } from "@root/utils/getFirebaseAuthErrorMessage";

dotenv.config();

export const validate = (req: any, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }
  next();
};

export const validateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if ((process.env.NODE_ENV == "test")) {
      return next();
    }

    // If a token is present, verify it
    const userIdToken = req.cookies?.access_token;
    if (userIdToken) {
      return verifyFirebaseToken(userIdToken, res, req, next);
    }

    // Check if a session is present
    const sessionUser = req.session?.passport?.user;
    if (sessionUser) {
      req.user = sessionUser;
      return next();
    }

    // If no token is present, return a 409 Conflict error
    throw new ConflictError("No valid tokens provided.");
  } catch (error) {
    // Clear the cookie if the connect.sid is invalid
    res.clearCookie("connect.sid");

    // If the token is invalid, return a 409 Conflict error
    next(error);
  }
};

const verifyFirebaseToken = async (
  token: string,
  res: Response,
  req: AuthRequest,
  next: NextFunction
) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Attach the user object to the request object
    req.user = decodedToken;

    next();
  } catch (error) {
    // Clear the cookie if the access token is invalid
    res.clearCookie("access_token");

    // Get the error message
    const errorMessage = getFirebaseAuthErrorMessage(error);

    next(new ConflictError(errorMessage));
  }
};

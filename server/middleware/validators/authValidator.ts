import ValidationError from "@root/errors/ValidationError";
import { admin } from "../../config/firebase";
import { Request, Response, NextFunction } from "express";
import ConflictError from "@root/errors/ConflictError";
import dotenv from "dotenv";
import { AuthRequest } from "@root/types/authTypes";

dotenv.config();

const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if middleware is disabled via environment variable
    if (process.env.DISABLE_AUTH_MIDDLEWARE === "true") {
      return next();
    }

    const userIdToken = req.cookies?.access_token;

    if (!userIdToken) {
      throw new ValidationError("No token provided.");
    }

    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(userIdToken);

    // Attach the user data to the request object
    req.user = decodedToken;

    next();
  } catch (error) {
    // If the token is invalid, return a 409 Conflict error
    next(error);
  }
};

export { verifyToken };

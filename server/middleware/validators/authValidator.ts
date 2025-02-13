import ValidationError from "@root/errors/ValidationError";
import { admin } from "../../config/firebase";
import { Request, Response, NextFunction } from "express";
import ConflictError from "@root/errors/ConflictError";
import dotenv from "dotenv";

dotenv.config();

interface AuthRequest extends Request {
  user?: any; // Or define a proper type instead of `any`
}

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

    const userIdToken = req.cookies.access_token;
    if (!userIdToken) {
      next(new ValidationError("No token provided."));
    }

    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(userIdToken);

    // Attach the user data to the request object
    req.user = decodedToken;

    next();
  } catch (error) {
    // If the token is invalid, return a 409 Conflict error
    next(new ConflictError("Invalid token."));
  }
};

export { verifyToken };

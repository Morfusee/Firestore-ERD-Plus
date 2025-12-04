import { Request, Response, NextFunction } from "express";
import { encrypt } from "@root/utils/encryption";

// Middleware to encrypt the "data" field before saving to the database
export const encryptDataMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.body.data) {
      req.body.data = encrypt(req.body.data);
    }

    // Proceed to the next middleware
    next();
  } catch (error: any) {
    res.status(500).json({
      message: "Error encrypting data: " + error.message,
    });
  }
};

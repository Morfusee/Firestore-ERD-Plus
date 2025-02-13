import { NextFunction, Request, Response } from "express";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "../config/firebase";
import BadRequestError from "@root/errors/BadRequestError";
import CreatedResponse from "@root/success/CreatedResponse";
import SuccessResponse from "@root/success/SuccessResponse";
import { AuthRequest } from "@root/types/authTypes";

const auth = getAuth();

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new BadRequestError("Email and password are required."));
    }

    // Create the user in Firebase Auth
    const user = await createUserWithEmailAndPassword(auth, email, password);

    if (!user) {
      return next(new BadRequestError("Error creating user."));
    }

    // Send email verification
    const emailVerification = await sendEmailVerification(user.user).catch(
      (err) => next(new BadRequestError("Error sending email verification."))
    );

    next(new SuccessResponse("User registered successfully.", user.user));
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new BadRequestError("Email and password are required."));
    }

    // Sign in the user with email and password
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (!userCredential) {
      return next(new BadRequestError("Error signing in user."));
    }

    const userIdToken = await userCredential.user.getIdToken();

    if (!userIdToken) {
      return next(new BadRequestError("Error getting user token."));
    }

    res.cookie("access_token", userIdToken, {
      httpOnly: true,
      // secure: true,
      // sameSite: "strict",
    });

    next(new SuccessResponse("User logged in successfully.", userCredential));
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await signOut(auth).then(() => {
      res.clearCookie("access_token");
    });

    next(new SuccessResponse("User logged out successfully.", null));
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new BadRequestError("Email is required."));
    }

    // Send password reset email
    await sendPasswordResetEmail(auth, email);

    next(new SuccessResponse("Password reset email sent successfully.", null));
  } catch (error) {
    next(error);
  }
};

export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authUser = req.user;

    if (!authUser) {
      throw new BadRequestError("User not authenticated.");
    }

    next(new SuccessResponse("User authenticated successfully.", authUser));
  } catch (error) {
    next(error);
  }
};

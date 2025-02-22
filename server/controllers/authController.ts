import BadRequestError from "@root/errors/BadRequestError";
import User from "@root/models/userModel";
import CreatedResponse from "@root/success/CreatedResponse";
import SuccessResponse from "@root/success/SuccessResponse";
import { AuthRequest, AuthUser } from "@root/types/authTypes";
import { NextFunction, Request, Response } from "express";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "../config/firebase";
import passport from "../config/passport";
import dotenv from "dotenv";
import ConflictError from "@root/errors/ConflictError";

dotenv.config();
const auth = getAuth();

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password, displayName } = req.body;

    if (!email || !password) {
      return next(new BadRequestError("Email and password are required."));
    }

    // Check if email or username already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    // This prevents hitting the database and Firebase Auth if the user already exists
    if (existingUser) {
      return next(new ConflictError("Email or username is already in use."));
    }

    // Create the user
    const newUser = new User({
      username,
      email,
      displayName: displayName || username,
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    if (!savedUser) {
      throw new BadRequestError("Error saving user to database.");
    }

    // Create the user in Firebase Auth
    const user = await createUserWithEmailAndPassword(auth, email, password);

    if (!user) {
      return next(new BadRequestError("Error creating user."));
    }

    // Send email verification
    const emailVerification = await sendEmailVerification(user.user).catch(
      (_err) => next(new BadRequestError("Error sending email verification."))
    );

    // Get the user token
    const userIdToken = await user.user.getIdToken();

    if (!userIdToken) {
      return next(new BadRequestError("Error getting user token."));
    }

    // Set the access token in a cookie
    res.cookie("access_token", userIdToken, {
      httpOnly: true,
      // Enable this for production
      // secure: true,
      // sameSite: "none",
    });

    next(
      new CreatedResponse("User registered successfully.", {
        createdUser: savedUser,
      })
    );
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

    // Get user from database
    const user = await User.findOne({
      email: { $regex: email, $options: "i" },
    });

    // This prevents hitting the database and Firebase Auth if the user doesn't exist
    if (!user) {
      return next(new BadRequestError("Invalid email or password."));
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

    // Get the user token
    const userIdToken = await userCredential.user.getIdToken();

    if (!userIdToken) {
      return next(new BadRequestError("Error getting user token."));
    }

    // Set the access token in a cookie
    res.cookie("access_token", userIdToken, {
      httpOnly: true,
      // Enable this for production
      // secure: true,
      // sameSite: "none",
    });

    next(new SuccessResponse("User logged in successfully.", { user }));
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
    // Log the user out of Firebase Auth
    await signOut(auth).then(() => {
      res.clearCookie("access_token");
    });

    // Log the user out if they are using sessions
    // This auto purges the session from the database
    req.logout((err: any) => {
      if (err) {
        next(err);
      }
    });

    // Clear authentication-related cookies from the client
    res.clearCookie("access_token");
    res.clearCookie("connect.sid", { path: "/" });

    next(new SuccessResponse("User logged out successfully.", null));
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  _res: Response,
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
  _res: Response,
  next: NextFunction
) => {
  try {
    const authUser: AuthUser = req.user;

    if (!authUser) {
      throw new BadRequestError("User not authenticated.");
    }

    // Get user from database
    const user = await User.find({
      email: { $regex: authUser.email, $options: "i" },
    }).then((res) => res[0]);

    if (!user) {
      throw new BadRequestError("Error getting user.");
    }

    next(
      new SuccessResponse("User authenticated successfully.", {
        user,
      })
    );
  } catch (error) {
    next(error);
  }
};

// Handle Google OAuth callback
export const googleCallback = passport.authenticate("google", {
  successRedirect: process.env.CLIENT_URL!,
  failureRedirect: "/google/callback/failed",
});

// Authenticate with Google OAuth
export const googleAuth = passport.authenticate("google", {
  scope: ["email", "profile"],
  prompt: "select_account",
});

export const googleAuthFailed = (
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  next(new BadRequestError("Google authentication failed."));
};

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
import { AuthRequest, AuthUser } from "@root/types/authTypes";
import User from "@root/models/userModel";

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

    // Create the user in Firebase Auth
    const user = await createUserWithEmailAndPassword(auth, email, password);

    if (!user) {
      return next(new BadRequestError("Error creating user."));
    }

    // Send email verification
    const emailVerification = await sendEmailVerification(user.user).catch(
      (err) => next(new BadRequestError("Error sending email verification."))
    );

    // Get the user token
    const userIdToken = await user.user.getIdToken();

    if (!userIdToken) {
      return next(new BadRequestError("Error getting user token."));
    }

    // Set the access token in a cookie
    res.cookie("access_token", userIdToken, {
      httpOnly: true,
      // secure: true,
      // sameSite: "strict",
    });

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
      // secure: true,
      // sameSite: "strict",
    });

    // Get user from database
    const user = await User.find({
      email: { $regex: email, $options: "i" },
    }).then((res) => res[0]);

    if (!user) {
      return next(new BadRequestError("Error getting user."));
    }

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

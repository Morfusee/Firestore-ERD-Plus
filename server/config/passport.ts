import User from "@root/models/userModel";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import generateUniqueUsername from "@root/utils/usernameGenerator";

dotenv.config();

// Google OAuth Configuration
passport.use(
  new GoogleStrategy(
    {
      // Get your credentials from the Google Cloud Console
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Callback URL should match the one in the Google Cloud Console
      callbackURL: `/auth/google/callback`,
      scope: ["email", "profile"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists in your database
        let user = await User.findOne({
          email: profile.emails ? profile.emails[0].value : null,
        });

        if (!user) {
          // Pass the uniqueness check as a parameter
          const isUsernameUnique = async (username: string): Promise<boolean> =>
            !(await User.exists({ username }));

          // Generate a unique username
          const username = await generateUniqueUsername(isUsernameUnique);

          // Create new user
          user = new User({
            username: username,
            displayName: profile.displayName,
            email: profile.emails ? profile.emails[0].value : null, // Handle missing email
          });
          await user.save();
        }

        return done(null, user); // Pass the user object to serializeUser
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize and Deserialize user
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser(async (deserializedUser: any, done) => {
  try {
    const user = await User.findById(deserializedUser.id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;

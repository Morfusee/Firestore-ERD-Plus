import {
    AuthError,
    signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    User,
} from "firebase/auth";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { auth } from "../lib/firebase";

/**
 * Firebase Auth Context Type
 * Provides authentication state and methods
 */
interface FirebaseAuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithEmailAndPassword: (
    email: string,
    password: string
  ) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  clearError: () => void;
}

/**
 * Create Firebase Auth Context
 */
const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(
  undefined
);

/**
 * Firebase Auth Provider Component
 *
 * Manages Firebase authentication state and provides it to child components
 *
 * Usage:
 * ```tsx
 * <FirebaseAuthProvider>
 *   <App />
 * </FirebaseAuthProvider>
 * ```
 */
export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set up Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Sign in with email and password
   */
  const signInWithEmailAndPassword = async (
    email: string,
    password: string
  ): Promise<User> => {
    try {
      setError(null);
      const result = await firebaseSignInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Get the ID token to send to your backend
      const idToken = await result.user.getIdToken();

      // Authenticate with your backend
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
          credentials: "include", // Important for cookies
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Backend authentication failed");
      }

      setUser(result.user);
      return result.user;
    } catch (error) {
      const authError = error as AuthError;
      const errorMessage =
        authError.message || "Failed to sign in with email and password";
      setError(errorMessage);
      setUser(null);
      throw authError;
    }
  };

  /**
   * Sign in with Google
   */
  const signInWithGoogle = async (): Promise<User> => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();

      // Add scopes for additional permissions if needed
      provider.addScope("profile");
      provider.addScope("email");

      // Set custom parameters for OAuth consent screen
      provider.setCustomParameters({
        prompt: "consent",
      });

      const result = await signInWithPopup(auth, provider);

      // Get the ID token to send to your backend
      const idToken = await result.user.getIdToken();

      // Authenticate with your backend
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
          credentials: "include", // Important for cookies
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Backend authentication failed");
      }

      setUser(result.user);
      return result.user;
    } catch (err) {
      const error = err as AuthError;
      const errorMessage = error.message || "Failed to sign in with Google";
      setError(errorMessage);
      setUser(null);
      throw error;
    }
  };

  /**
   * Sign out from Firebase and backend
   */
  const logout = async (): Promise<void> => {
    try {
      setError(null);

      // Logout from backend
      await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      }).catch(() => {
        // Backend logout failure shouldn't prevent Firebase logout
        console.warn(
          "Backend logout failed, but continuing with Firebase logout"
        );
      });

      // Sign out from Firebase
      await signOut(auth);
      setUser(null);
    } catch (err) {
      const error = err as AuthError;
      const errorMessage = error.message || "Failed to sign out";
      setError(errorMessage);
      throw error;
    }
  };

  /**
   * Clear error message
   */
  const clearError = (): void => {
    setError(null);
  };

  const value: FirebaseAuthContextType = {
    user,
    loading,
    error,
    signInWithEmailAndPassword,
    signInWithGoogle,
    logout,
    clearError,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

/**
 * Hook to use Firebase Auth Context
 *
 * Usage:
 * ```tsx
 * const { user, loading, signInWithGoogle, logout } = useFirebaseAuth();
 * ```
 */
export function useFirebaseAuth(): FirebaseAuthContextType {
  const context = useContext(FirebaseAuthContext);

  if (context === undefined) {
    throw new Error("useFirebaseAuth must be used within FirebaseAuthProvider");
  }

  return context;
}

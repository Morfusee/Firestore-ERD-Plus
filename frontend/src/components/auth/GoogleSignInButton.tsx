import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { Center, Loader, Stack } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { GoogleButton } from "../ui/SocialButtons";

/**
 * Example Google Sign-In Component
 *
 * This component demonstrates how to use the Firebase Auth context
 * for Google OAuth authentication.
 *
 * Usage:
 * ```tsx
 * import GoogleSignInButton from './GoogleSignInButton';
 *
 * export default function LoginPage() {
 *   return <GoogleSignInButton />;
 * }
 * ```
 */
export function GoogleSignInButton() {
  const navigate = useNavigate();
  const { loading, signInWithGoogle, clearError } = useFirebaseAuth();

  const handleSignIn = async () => {
    try {
      clearError();
      const user = await signInWithGoogle();

      if (user) {
        navigate({
          to: "/",
        });
      }
    } catch (err) {
      console.error("Sign in error:", err);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Center h={200}>
        <Loader />
      </Center>
    );
  }

  // Show sign-in button
  return (
    <Stack gap="md">
      <GoogleButton
        variant="filled"
        color="blue"
        onClick={handleSignIn}
        loading={loading}
        disabled={loading}
        fullWidth
      >
        Sign in with Google
      </GoogleButton>
    </Stack>
  );
}

export default GoogleSignInButton;

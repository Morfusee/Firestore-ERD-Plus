import { Alert, Button, Center, Loader, Stack, Text } from "@mantine/core";
import {
    IconAlertCircle,
    IconBrandGoogle,
    IconLogout,
} from "@tabler/icons-react";
import { useGoogleAuth } from "../../hooks/useGoogleAuth";
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
  const {
    user,
    loading,
    error,
    isAuthenticated,
    signInWithGoogle,
    logout,
    clearError,
  } = useGoogleAuth();

  const handleSignIn = async () => {
    try {
      clearError();
      await signInWithGoogle();
    } catch (err) {
      console.error("Sign in error:", err);
    }
  };

  const handleLogout = async () => {
    try {
      clearError();
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
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

  // User is authenticated
  if (isAuthenticated && user) {
    return (
      <Stack gap="md">
        <Alert
          icon={<IconBrandGoogle size={16} />}
          title="Signed In"
          color="green"
        >
          <Text size="sm">Email: {user.email}</Text>
          <Text size="sm">Name: {user.displayName}</Text>
        </Alert>

        <Button
          variant="filled"
          color="red"
          leftSection={<IconLogout size={16} />}
          onClick={handleLogout}
          loading={loading}
          fullWidth
        >
          Sign Out
        </Button>
      </Stack>
    );
  }

  // Show sign-in button
  return (
    <Stack gap="md">
      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Authentication Error"
          color="red"
          onClose={() => clearError()}
          withCloseButton
        >
          {error}
        </Alert>
      )}

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

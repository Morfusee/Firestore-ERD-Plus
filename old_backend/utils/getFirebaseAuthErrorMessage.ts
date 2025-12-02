export const getFirebaseAuthErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "code" in error) {
    const errorCode = (error as { code: string }).code;

    switch (errorCode) {
      case "auth/argument-error":
        return "Invalid token.";
      case "auth/id-token-expired":
        return "Token expired.";
      default:
        return "Authentication failed.";
    }
  }

  return "An unknown error occurred.";
};

import { firebaseErrorMessages } from "./firebaseErrorMessages";

export const getErrorMessage = (
  error: unknown,
  fallbackError?: unknown
): string => {
  if (typeof error === "object" && error !== null && "code" in error) {
    return (
      firebaseErrorMessages[error.code as keyof typeof firebaseErrorMessages] ||
      "Unknown error"
    );
  }
  return typeof fallbackError === "string"
    ? fallbackError
    : "An unknown error occurred";
};

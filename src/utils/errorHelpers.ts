import { firebaseErrorMessages } from "./firebaseErrorMessages";

export const getErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "code" in error) {
    return (
      firebaseErrorMessages[error.code as keyof typeof firebaseErrorMessages] ||
      "Unknown error"
    );
  }
  return typeof error === "string" ? error : "An unknown error occurred";
};

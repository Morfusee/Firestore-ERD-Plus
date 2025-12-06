import { User } from 'firebase/auth';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';

/**
 * Hook for Google OAuth authentication
 * 
 * Provides methods and state for Google sign-in flow
 * 
 * Usage:
 * ```tsx
 * const { user, loading, error, signInWithGoogle, logout } = useGoogleAuth();
 * 
 * if (loading) return <div>Loading...</div>;
 * 
 * if (user) {
 *   return <button onClick={logout}>Logout</button>;
 * }
 * 
 * return (
 *   <>
 *     {error && <p>{error}</p>}
 *     <button onClick={signInWithGoogle}>Sign in with Google</button>
 *   </>
 * );
 * ```
 */
export function useGoogleAuth() {
  const { user, loading, error, signInWithGoogle, logout, clearError } =
    useFirebaseAuth();

  return {
    user: user as User | null,
    loading,
    error,
    signInWithGoogle,
    logout,
    clearError,
    isAuthenticated: !!user,
  };
}

/**
 * Hook to get current authenticated user
 * 
 * Usage:
 * ```tsx
 * const user = useAuthUser();
 * if (user) {
 *   console.log(user.email);
 * }
 * ```
 */
export function useAuthUser(): User | null {
  const { user } = useFirebaseAuth();
  return user;
}

/**
 * Hook to get authentication loading state
 * 
 * Usage:
 * ```tsx
 * const loading = useAuthLoading();
 * if (loading) return <LoadingSpinner />;
 * ```
 */
export function useAuthLoading(): boolean {
  const { loading } = useFirebaseAuth();
  return loading;
}

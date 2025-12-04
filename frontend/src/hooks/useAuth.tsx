import { useEffect, useState } from "react";
import useUserRepo from "../data/repo/useUserRepo";

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const { user, checkEmailVerification, authenticateUser } = useUserRepo();

  useEffect(() => {
    authenticateUser()
      .then(async (isAuth) => {
        setIsAuthenticated(isAuth || false);
        console.log(user);
        const emailVerified = await checkEmailVerification();
        setEmailVerified(emailVerified);
        setLoading(false);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setLoading(false);
      });
  }, []);

  return { isAuthenticated, emailVerified, loading };
}

export default useAuth;

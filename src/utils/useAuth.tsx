import { useEffect, useState } from "react";
import useUserRepo from "../data/repo/useUserRepo";

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const { authenticateUser } = useUserRepo();

  useEffect(() => {
    authenticateUser()
      .then((isAuth) => {
        setIsAuthenticated(isAuth || false);
        setLoading(false);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setLoading(false);
      });
  }, []);

  return { isAuthenticated, loading };
}

export default useAuth;

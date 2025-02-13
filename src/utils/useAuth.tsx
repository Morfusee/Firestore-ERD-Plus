import { useEffect, useState } from "react";
import { checkAuthApi } from "../data/api/authApi";
import useUserRepo from "../data/repo/useUserRepo";

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getUser } = useUserRepo();
  const testUserId = "67a89f3a14e42f94a3b68a2d";

  useEffect(() => {
    checkAuthApi()
      .then((user) => {
        setIsAuthenticated(user);
        getUser(testUserId);
        setLoading(false);
      })
      .catch(() => {
        setIsAuthenticated(null);
        setLoading(false);
      });
  }, []);

  return { isAuthenticated, loading };
}

export default useAuth;

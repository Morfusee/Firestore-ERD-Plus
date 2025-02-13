import { useUserStore } from "../../store/useUserStore";
import { loginUserApi } from "../api/authApi";
import { getUserApi, updateUserApi } from "../api/userApi";

const useUserRepo = () => {
  const user = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const testUserId = "67a89f3a14e42f94a3b68a2d";

  const loginUser = async (email: string, password: string) => {
    try {
      const loginResponse = await loginUserApi(email, password);

      console.log(loginResponse)

      // Set the current user to the user response from api
      getUser(testUserId);
    } catch (err) {
      console.log(err);
    }
  };

  const getUser = async (userId: string) => {
    try {
      // Get user from api base on id
      const res = await getUserApi(userId);

      // Set the current user to the user response from api
      setCurrentUser(res.data.user);
    } catch (err) {
      console.log(err);
    }
  };

  const changeUserDisplayname = async (userId: string, displayName: string) => {
    try {
      const res = await updateUserApi(userId, displayName);

      setCurrentUser(res.data.updatedUser);
    } catch (err) {
      console.log("Error updating the user", err);
    }
  };

  return {
    user,
    getUser,
    loginUser,
    changeUserDisplayname,
  };
};

export default useUserRepo;

import { useUserStore } from "../../store/useUserStore";
import { loginUserApi, registerUserApi } from "../api/authApi";
import { createUserApi, getUserApi, updateUserApi } from "../api/userApi";

const useUserRepo = () => {
  const user = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const testUserId = "67a89f3a14e42f94a3b68a2d";

  const loginUser = async (email: string, password: string) => {
    try {
      const loginResponse = await loginUserApi(email, password);

      // Set the current user to the user response from api
      await getUser(testUserId);
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

  const registerUser = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      const registerResponse = await registerUserApi(username, email, password);

      if (!registerResponse.success) {
        throw new Error("Failed to register user");
      }

      setCurrentUser(registerResponse.data.createdUser);
    } catch (error) {
      console.log(error);
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
    registerUser,
    changeUserDisplayname,
  };
};

export default useUserRepo;

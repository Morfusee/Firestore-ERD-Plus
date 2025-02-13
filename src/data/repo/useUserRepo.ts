import { useUserStore } from "../../store/useUserStore";
import {
  authenticateUserApi,
  loginUserApi,
  registerUserApi,
} from "../api/authApi";
import { createUserApi, getUserApi, updateUserApi } from "../api/userApi";

const useUserRepo = () => {
  const user = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  const loginUser = async (email: string, password: string) => {
    try {
      const loginResponse = await loginUserApi(email, password);

      // Set the current user to the user response from api
      setCurrentUser(loginResponse.data.user);
    } catch (err) {
      console.log(err);
    }
  };

  const getUser = async (userId: string) => {
    try {
      // Get user from api base on id
      const getUserResponse = await getUserApi(userId);

      // Set the current user to the user response from api
      setCurrentUser(getUserResponse.data.user);
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

  const authenticateUser = async () => {
    try {
      const authenticateUserResponse = await authenticateUserApi();

      // Set the current user to the user response from api
      setCurrentUser(authenticateUserResponse.data.user);

      return authenticateUserResponse.success
    } catch (error) {
      console.log(error);
    }
  };

  return {
    user,
    getUser,
    loginUser,
    registerUser,
    changeUserDisplayname,
    authenticateUser,
  };
};

export default useUserRepo;

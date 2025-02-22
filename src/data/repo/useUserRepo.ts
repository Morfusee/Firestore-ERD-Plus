import axios from "axios";
import { useEditorStore } from "../../store/useEditorStore";
import { useProjectStore } from "../../store/useProjectStore";
import { useUserStore } from "../../store/useUserStore";
import { APIResponse, FetchedUser } from "../../types/APITypes";
import {
  authenticateUserApi,
  loginUserApi,
  logoutUserApi,
  registerUserApi,
} from "../api/authApi";
import { getUserApi, updateUserApi } from "../api/userApi";

const useUserRepo = () => {
  const user = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const setProfilePic = useUserStore((state) => state.setProfileImage);
  const clearSelectedProject = useProjectStore(
    (state) => state.clearSelectedProject
  );
  const clearStateSnapshot = useEditorStore(
    (state) => state.clearStateSnapshot
  );

  const loginUser = async (
    email: string,
    password: string
  ): Promise<APIResponse<FetchedUser>> => {
    try {
      const loginResponse = await loginUserApi(email, password);

      // Set the current user to the user response from api
      setCurrentUser(loginResponse.data.user);

      // Return the whole login response to get the message and success status
      return loginResponse;
    } catch (err: any | APIResponse<FetchedUser>) {
      // Log the error
      console.log(err);

      // Check if the error is an AxiosError
      if (axios.isAxiosError(err)) {
        return err.response?.data;
      }

      // Return the error response either way
      return err.response?.data;
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

      setCurrentUser(registerResponse.data.createdUser);

      return registerResponse.success;
    } catch (error) {
      console.log(error);
      return false;
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

      return authenticateUserResponse.success;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const logoutUser = async () => {
    try {
      const logoutUserResponse = await logoutUserApi();

      // Set the current user to null
      setCurrentUser(null);

      /* These two solves the appearance of pending/unsaved changes 
        from one account to another when logging in */

      // Clear the selected project
      clearSelectedProject();

      // Clear the editor state snapshot
      clearStateSnapshot();

      return logoutUserResponse.success;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  // This is just for local state update
  const setProfileImage = (profilePic: string) => {
    setProfilePic(profilePic);
  };

  // Upload profile image to backend data store
  const uploadProfileImage = () => {};

  return {
    user,
    getUser,
    loginUser,
    registerUser,
    changeUserDisplayname,
    authenticateUser,
    logoutUser,
    setProfileImage,
    uploadProfileImage,
  };
};

export default useUserRepo;

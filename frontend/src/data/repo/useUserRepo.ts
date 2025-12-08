import {
  postApiAuthLoginMutation,
  postApiAuthLogoutMutation,
} from "@/integrations/api/generated/@tanstack/react-query.gen";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useEditorStore } from "../../store/useEditorStore";
import { useProjectStore } from "../../store/useProjectStore";
import { IUser, useUserStore } from "../../store/useUserStore";
import { APIResponse, CreatedUser, FetchedUser } from "../../types/APITypes";
import {
  authenticateUserApi,
  registerUserApi,
  resetPasswordApi,
} from "../api/authApi";
import {
  getUserApi,
  getUserByUsernameApi,
  updateUserApi,
  uploadProfilePictureApi,
} from "../api/userApi";

const useUserRepo = () => {
  const user = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const setProfilePic = useUserStore((state) => state.setProfileImage);
  const clearSelectedProject = useProjectStore(
    (state) => state.clearSelectedProject
  );
  const clearSelectedProjectRole = useProjectStore(
    (state) => state.clearSelectedProjectRole
  );
  const clearStateSnapshot = useEditorStore(
    (state) => state.clearStateSnapshot
  );

  const { mutateAsync: logoutMutateAsync } = useMutation(
    postApiAuthLogoutMutation()
  );

  const { mutateAsync: loginMutateAsync } = useMutation(
    postApiAuthLoginMutation()
  );

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

  const getUserByUsername = async (
    username: IUser["username"],
    excludedUsers: IUser["username"][] = []
  ) => {
    try {
      // Get user from api base on username
      const getUserByUsernameResponse = await getUserByUsernameApi(
        username,
        excludedUsers
      );

      return getUserByUsernameResponse.data.users;
    } catch (err) {
      console.log(err);
    }
  };

  const registerUser = async (
    username: string,
    email: string,
    password: string
  ): Promise<APIResponse<CreatedUser>> => {
    try {
      const registerResponse = await registerUserApi(username, email, password);

      setCurrentUser(registerResponse.data.createdUser);

      // Return the whole login response to get the message and success status
      return registerResponse;
    } catch (err: any | APIResponse<CreatedUser>) {
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

  const resetPassword = async (email: string) => {
    try {
      const res = await resetPasswordApi(email);
      return res;
    } catch (err: any) {
      console.log(err);
      if (axios.isAxiosError(err)) {
        return err.response?.data;
      }
      return { success: false, message: err.message || "Error" } as any;
    }
  };

  // This is just for local state update
  const setProfileImage = (profilePic: string) => {
    setProfilePic(profilePic);
  };

  // Upload profile image to backend data store
  const uploadProfileImage = async (
    userId: string,
    profilePicture: File
  ): Promise<APIResponse<FetchedUser>> => {
    try {
      // Create a new FormData object
      const formData = new FormData();

      // Append the file to the formData object
      formData.append("profilePicture", profilePicture);

      // Send the file to the backend
      const uploadProfilePictureResponse = await uploadProfilePictureApi(
        userId,
        formData
      );

      // Re-set the user again
      setCurrentUser(uploadProfilePictureResponse.data.user);

      // Return the response
      return uploadProfilePictureResponse;
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

  return {
    user,
    getUser,
    getUserByUsername,
    registerUser,
    changeUserDisplayname,
    authenticateUser,
    resetPassword,
    setProfileImage,
    uploadProfileImage,
  };
};

export default useUserRepo;

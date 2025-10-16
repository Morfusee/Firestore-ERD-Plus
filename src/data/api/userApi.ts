import { IUser } from "../../store/useUserStore";
import {
  APIResponse,
  CreatedUser,
  FetchedUser,
  FetchedUsers,
  UpdatedUser,
} from "../../types/APITypes";
import axiosInstance from "../../utils/axiosInstance";

export const getUserApi = async (userId: string) => {
  const response = await axiosInstance
    .get<APIResponse<FetchedUser>>(`/users/${userId}`)
    .then((res) => res.data);

  return response;
};

export const getUserByUsernameApi = async (
  username: IUser["username"],
  excludedUsers: IUser["username"][]
) => {
  const response = await axiosInstance
    .post<APIResponse<FetchedUsers>>("/users/search", {
      username,
      excludedUsers,
    })
    .then((res) => res.data);

  console.log(response);

  return response;
};

export const updateUserApi = async (userId: string, newDisplayName: string) => {
  const response = await axiosInstance
    .patch<APIResponse<UpdatedUser>>(`/users/${userId}`, {
      displayName: newDisplayName,
    })
    .then((res) => res.data);

  return response;
};

export const createUserApi = async (username: string, email: string) => {
  const response = await axiosInstance
    .post<APIResponse<CreatedUser>>(`/users/`, {
      username,
      email,
    })
    .then((res) => res.data);

  return response;
};

export const uploadProfilePictureApi = async (
  userId: string,
  formData: FormData
) => {
  const response = await axiosInstance
    .patch<APIResponse<FetchedUser>>(
      `/users/${userId}/profile-picture`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    .then((res) => res.data);

  return response;
};

export const deleteUserApi = async (userId: string) => {
  const response = await axiosInstance
    .delete<APIResponse<{ message: string }>>(`/users/${userId}`)
    .then((res) => {
      res.data;
    });

  return response;
};

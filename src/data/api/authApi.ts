import { APIResponse, CreatedUser, FetchedUser } from "../../types/APITypes";
import axiosInstance from "../../utils/axiosInstance";

export const authenticateUserApi = async () => {
  const response = await axiosInstance
    .get<APIResponse<FetchedUser>>(`/auth/check-auth`)
    .then((res) => {
      if (!res.data.success) {
        throw new Error("Failed to authenticate user");
      }

      return res.data;
    })
    .catch((err) => console.error(err));

  return response;
};

export const loginUserApi = async (email: string, password: string) => {
  const response = await axiosInstance
    .post<APIResponse<FetchedUser>>(`/auth/login`, {
      email,
      password,
    })
    .then((res) => {
      if (!res.data.success) {
        throw new Error("Failed to login user");
      }

      return res.data;
    })
    .catch((err) => console.error(err));

  return response;
};

export const registerUserApi = async (
  username: string,
  email: string,
  password: string
) => {
  const response = await axiosInstance
    .post<APIResponse<CreatedUser>>(`/auth/register`, {
      username,
      email,
      password,
    })
    .then((res) => {
      if (!res.data.success) {
        throw new Error("Failed to register user");
      }

      return res.data;
    })
    .catch((err) => console.error(err));

  return response;
};

export const logoutUserApi = async () => {
  const response = await axiosInstance
    .post<APIResponse<null>>(`/auth/logout`)
    .then((res) => {
      if (!res.data.success) {
        throw new Error("Failed to register user");
      }

      return res.data;
    })
    .catch((err) => console.error(err));

  return response;
};

import { APIResponse, CreatedUser, FetchedUser } from "../../types/APITypes";
import axiosInstance from "../../utils/axiosInstance";

export const authenticateUserApi = async () => {
  const response = await axiosInstance
    .get<APIResponse<FetchedUser>>(`/api/Auth/me`)
    .then((res) => {
      if (!res.data.success) {
        throw new Error("Failed to authenticate user");
      }

      return res.data;
    });

  return response;
};

export const loginUserApi = async (idToken: string) => {
  const response = await axiosInstance
    .post<APIResponse<FetchedUser>>(`/api/Auth/login`, {
      idToken,
    })
    .then((res) => {
      if (!(res.statusText === "OK")) {
        throw new Error("Failed to login user");
      }

      return res.data;
    });

  return response;
};

export const registerUserApi = async (
  username: string,
  email: string,
  idToken: string,
  displayName?: string
) => {
  const response = await axiosInstance
    .post<APIResponse<CreatedUser>>(`/api/Auth/register`, {
      idToken,
      username,
      email,
      displayName: displayName ?? username,
    })
    .then((res) => {
      if (!res.data.success) {
        throw new Error("Failed to register user");
      }

      return res.data;
    });

  return response;
};

export const logoutUserApi = async () => {
  const response = await axiosInstance
    .post<APIResponse<null>>(`/api/Auth/logout`)
    .then((res) => {
      if (!res.data.success) {
        throw new Error("Failed to logout user");
      }

      return res.data;
    });

  return response;
};

export const resetPasswordApi = async (email: string) => {
  const response = await axiosInstance
    .post(`/api/Auth/reset-password`, { email })
    .then((res) => {
      // backend envelope uses isSuccess; accept legacy success during migration
      const success = res.data.isSuccess ?? res.data.success;
      if (!success) {
        throw new Error(res.data.message || "Failed to send password reset email");
      }

      return { ...res.data, success };
    });

  return response;
};

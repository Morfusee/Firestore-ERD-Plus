import { APIResponse, CreatedUser, FetchedUser } from "../../types/APITypes";

export const authenticateUserApi = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_URL}/auth/check-auth`,
    {
      method: "GET",
      credentials: "include",
    }
  )
    .then((res) => res.json())
    .catch((err) => console.error(err));

  if (!response.success) {
    throw new Error("User is not authenticated");
  }

  return response as APIResponse<FetchedUser>;
};

export const loginUserApi = async (email: string, password: string) => {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_URL}/auth/login`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  )
    .then((res) => res.json())
    .catch((err) => console.error(err));

  if (!response.success) {
    throw new Error("Failed to login user");
  }

  return response as APIResponse<FetchedUser>;
};

export const registerUserApi = async (
  username: string,
  email: string,
  password: string
) => {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_URL}/auth/register`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    }
  )
    .then((res) => res.json())
    .catch((err) => console.error(err));

  if (!response.success) {
    throw new Error("Failed to register user");
  }

  return response as APIResponse<CreatedUser>;
};

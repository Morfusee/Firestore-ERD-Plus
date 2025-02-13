import { APIResponse, FetchedUser, UpdatedUser } from "../../types/APITypes";

export const getUserApi = async (userId: string) => {
  const response = await fetch(
    import.meta.env.VITE_SERVER_URL + `/users/${userId}`,
    {
      credentials: "include",
    }
  )
    .then((res) => res.json())
    .catch((err) => console.error(err));

  return response as APIResponse<FetchedUser>;
};

export const updateUserApi = async (userId: string, newDisplayName: string) => {
  const response = await fetch(
    import.meta.env.VITE_SERVER_URL + `/users/${userId}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        displayName: newDisplayName,
      }),
    }
  )
    .then((res) => res.json())
    .catch((err) => console.error(err));

  return response as APIResponse<UpdatedUser>;
};

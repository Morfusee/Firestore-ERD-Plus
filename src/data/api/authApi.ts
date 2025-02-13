export const checkAuthApi = async () => {
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

  return response;
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

  return response;
};

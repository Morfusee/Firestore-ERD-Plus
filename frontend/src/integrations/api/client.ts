import { auth } from "../firebase/firebase-client";
import { client } from "./generated/client.gen";

client.interceptors.request.use(async (request, options) => {
  try {
    // Get the current user's ID token
    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken();

      request.headers.set("Authorization", `Bearer ${token}`);
    }
  } catch (error) {
    console.error("Failed to get Firebase token:", error);
  }

  return request;
});

client.interceptors.response.use(async (response) => {
  if (response.status == 401) {
    console.warn("Unauthorized request - token may be expired");
  }

  return response;
});

client.setConfig({
  baseUrl: import.meta.env.VITE_SERVER_URL,
});

// Export the configured client
export { client };


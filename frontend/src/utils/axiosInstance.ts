import axios from "axios";
import { auth } from "../integrations/firebase/firebase-client";

// Set config defaults when creating the instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the Firebase ID token so axios calls use the same
// Authorization Bearer transport as the generated API client.
axiosInstance.interceptors.request.use(async (config) => {
  try {
    const token = await auth.currentUser?.getIdToken();

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
  } catch (error) {
    console.error("Failed to get Firebase token:", error);
  }

  return config;
});

// Response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.config?.skipInterceptor) return Promise.reject(error);

    console.log("Error from interceptor", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;

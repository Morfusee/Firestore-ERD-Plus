import axios from "axios";

// Set config defaults when creating the instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
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

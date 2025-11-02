import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:4000/api"
      : "/api",
  withCredentials: true,
});

// Add response interceptor to handle token refresh if needed
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Adjust if using cookies
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

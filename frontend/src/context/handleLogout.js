import { axiosInstance } from "./axiosInstance";
import toast from "react-hot-toast";

export const handleLogout = async (navigate) => {
  try {
    await axiosInstance.post("/auth/logout");
    console.log("logout");

    toast.success("Successfully logged out");
    navigate("/login");
  } catch (error) {
    toast.error("Logout failed. Please try again.");
  }
};

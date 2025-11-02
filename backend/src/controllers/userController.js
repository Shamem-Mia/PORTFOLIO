import User from "../models/userModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import UserInfo from "../models/userInfoModel.js";

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getUserData = async (req, res) => {
  const { email } = req.user;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }
  try {
    const user = await User.findOne({ email }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error in getUserData:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

import User from "../models/userModel.js";

const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, please login",
      });
    }

    const existingUser = await User.findById(req.user.id);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has a shop (is a shop owner)
    if (existingUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only Admin can perform this action",
      });
    }

    req.user = existingUser;
    next();
  } catch (err) {
    console.error("Shop owner middleware error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while verifying shop owner status",
    });
  }
};

export default isAdmin;

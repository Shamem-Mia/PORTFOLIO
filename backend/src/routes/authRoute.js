import express from "express";
import {
  isAuthenticated,
  login,
  logout,
  register,
  resendVerification,
  resetPassword,
  sendResetOtp,
  sendVerifyOTP,
  verifyAndCreateUser,
  verifyResetOtp,
} from "../controllers/authController.js";
import authUser from "../middlewares/userAuth.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/send-verify-otp", authUser, sendVerifyOTP);
router.post("/verify-and-create", verifyAndCreateUser);
router.post("/resend-verification", resendVerification);
router.post("/is-auth", authUser, isAuthenticated);
router.post("/send-reset-otp", sendResetOtp);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

export default router;

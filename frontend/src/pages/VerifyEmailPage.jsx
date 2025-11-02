import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../context/axiosInstance.js";
import { useAuthStore } from "../stores/useAuthStore.js";
// import toast from "react-hot-toast";

const VerifyEmailPage = () => {
  const { loading, error, message, verifyAndCreate } = useAuthStore();
  const [otp, setOtp] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { email } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    verifyAndCreate(email, otp, navigate);
  };

  const handleResendOtp = async () => {
    if (!email || !location.state?.tempUserData) {
      setError("Session expired. Please register again.");
      return;
    }

    setResendLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/auth/resend-verification", {
        email,
        tempUserData: location.state.tempUserData,
      });

      // Update the OTP input field with the new OTP
      setOtp("");

      if (response.data.updatedTempUserData) {
        location.state.tempUserData = response.data.updatedTempUserData;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-orange-500 mb-6">
          Verify Your Email
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <p className="mb-6 text-gray-600">
          We've sent a 6-digit verification code to{" "}
          <span className="font-semibold">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Didn't receive the code?{" "}
          <button
            onClick={handleResendOtp}
            disabled={resendLoading}
            className="text-orange-500 hover:text-orange-400 font-medium"
          >
            {resendLoading ? "Sending..." : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

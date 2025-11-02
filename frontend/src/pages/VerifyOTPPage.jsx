import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../context/axiosInstance";
import toast from "react-hot-toast";
import { useAuthStore } from "../stores/useAuthStore";

const VerifyOTPPage = () => {
  const { loading, verifyResetOtp } = useAuthStore();
  const { state } = useLocation();
  const email = state?.email;
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    verifyResetOtp(email, otp, navigate);
  };

  const handleResend = async () => {
    try {
      await axiosInstance.post("/auth/send-reset-otp", { email });
      toast.success("New code sent");
      setOtp("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend code");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-orange-500 mb-6">Verify Code</h1>
        <p className="text-gray-600 mb-6">
          Enter the 6-digit code sent to {email}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="w-full text-center text-2xl tracking-widest border rounded focus:ring-orange-500 focus:border-orange-500 p-2"
              maxLength={6}
              autoFocus
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className={`w-full py-2 px-4 rounded-md text-white bg-orange-500 hover:bg-orange-600 ${
              loading || otp.length !== 6 ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Didn't receive code?{" "}
          <button
            onClick={handleResend}
            className="text-orange-500 hover:text-orange-400"
          >
            Resend
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;

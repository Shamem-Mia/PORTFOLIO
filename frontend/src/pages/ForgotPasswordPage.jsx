import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

const ForgotPasswordPage = () => {
  const { loading, forgetPassword } = useAuthStore();
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    forgetPassword(email, navigate);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-orange-500 mb-6">
          Forgot Password
        </h1>
        <p className="text-gray-600 mb-6">
          Enter your email address and we'll send you a verification code to
          reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Sending OTP..." : "Send Verification Code"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <a
            href="/login"
            className="font-medium text-orange-500 hover:text-orange-400"
          >
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

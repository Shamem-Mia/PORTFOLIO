import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import { useAuthStore } from "./stores/useAuthStore";
import { Toaster } from "react-hot-toast";
import { LoaderCircle } from "lucide-react";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyOTPPage from "./pages/VerifyOTPPage";
import MessagesHandlePage from "./pages/MessagesHandlePage";
import AboutSection from "./components/AboutSection";
import NewsSection from "./components/NewsSection";
import SubjectsSection from "./components/SubjectsSection";
import ProfileSection from "./components/ProfileSection";
import ContactSection from "./components/ContactSection";
import ProjectsSection from "./pages/ProjectsSection";
import ResearchSection from "./components/ResearchSection";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderCircle className=" size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/handle-messages" element={<MessagesHandlePage />} />

        <Route path="/about" element={<AboutSection />} />
        <Route path="/news" element={<NewsSection />} />
        <Route path="/courses" element={<SubjectsSection />} />
        <Route path="/academic-profile" element={<ProfileSection />} />
        <Route path="/contact" element={<ContactSection />} />
        <Route path="/project" element={<ProjectsSection />} />
        <Route path="/research" element={<ResearchSection />} />
      </Routes>
    </div>
  );
};

export default App;

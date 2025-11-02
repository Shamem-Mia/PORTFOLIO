import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import HeroSection from "../components/HeroSection";
import ProfileSection from "../components/ProfileSection";
import AboutSection from "../components/AboutSection";
import NewsSection from "../components/NewsSection";
import SubjectsSection from "../components/SubjectsSection";
import ContactSection from "../components/ContactSection";
import { axiosInstance } from "../context/axiosInstance";
import AchievementsSection from "../components/AchievementsSection";
import ResearchSection from "../components/ResearchSection";
import ProjectsSection from "./ProjectsSection";
import CertificatesSection from "../components/CertificatesSection";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Blue Hero Section */}
      <div className="bg-primary-500">
        <HeroSection />
      </div>

      {/* About Section - Clean White */}
      <div className="bg-white">
        <AboutSection />
      </div>

      {/* Achievements & Research - Very Light Blue */}
      <div className="bg-primary-50">
        <AchievementsSection />
        <ResearchSection />
      </div>

      {/* Projects & Certificates - White */}
      <div className="bg-white">
        <ProjectsSection />
        <CertificatesSection />
      </div>

      {/* Profile & Subjects - Light Gray */}
      <div className="bg-gray-50">
        <SubjectsSection />
      </div>

      {/* News & Contact - White */}
      <div className="bg-white">
        <NewsSection />
        <ContactSection />
      </div>
    </div>
  );
};

export default HomePage;

import express from "express";
import {
  getAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from "../controllers/achievementController.js";
import {
  getResearchPapers,
  createResearchPaper,
  updateResearchPaper,
  deleteResearchPaper,
  downloadResearchPaper,
} from "../controllers/researchController.js";
import { uploadAchievement, uploadResearch } from "../config/multerConfig.js";
import authUser from "../middlewares/userAuth.js";
import isAdmin from "../middlewares/isAdmin.js";

const researchAchievementRouter = express.Router();

// Achievement routes
researchAchievementRouter.get("/achievements", getAchievements);
researchAchievementRouter.post(
  "/achievements",
  authUser,
  isAdmin,
  uploadAchievement.single("photo"),
  createAchievement
);
researchAchievementRouter.put(
  "/achievements/:id",
  authUser,
  isAdmin,
  uploadAchievement.single("photo"),
  updateAchievement
);
researchAchievementRouter.delete(
  "/achievements/:id",
  authUser,
  isAdmin,
  deleteAchievement
);

// Research routes
researchAchievementRouter.get("/research", getResearchPapers);
researchAchievementRouter.post(
  "/research",
  authUser,
  isAdmin,
  uploadResearch.single("pdfFile"),
  createResearchPaper
);
researchAchievementRouter.put(
  "/research/:id",
  authUser,
  isAdmin,
  uploadResearch.single("pdfFile"),
  updateResearchPaper
);
researchAchievementRouter.delete(
  "/research/:id",
  authUser,
  isAdmin,
  deleteResearchPaper
);

researchAchievementRouter.get("/research/:id/download", downloadResearchPaper);

export default researchAchievementRouter;

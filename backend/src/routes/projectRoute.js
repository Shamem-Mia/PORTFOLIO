import express from "express";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectsByCategory,
} from "../controllers/projectController.js";
import { uploadProject } from "../config/multerConfig.js";
import authUser from "../middlewares/userAuth.js";
import isAdmin from "../middlewares/isAdmin.js";

const projectRouter = express.Router();

projectRouter.get("/", getProjects);
projectRouter.get("/category/:category", getProjectsByCategory);
projectRouter.get("/:id", getProjectById);
projectRouter.post(
  "/",
  authUser,
  isAdmin,
  uploadProject.array("images", 10),
  createProject
);
projectRouter.put(
  "/:id",
  authUser,
  isAdmin,
  uploadProject.array("images", 10),
  updateProject
);
projectRouter.delete("/:id", authUser, isAdmin, deleteProject);

export default projectRouter;

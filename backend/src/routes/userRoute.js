import express from "express";
import authUser from "../middlewares/userAuth.js";
import { getUserData } from "../controllers/userController.js";
import upload from "../config/multerConfig.js";
import {
  deleteContactMessage,
  deleteCourse,
  deleteNewsItem,
  getAboutInfo,
  getAcademicProfile,
  getContactInfo,
  getContactMessages,
  getCourses,
  getHeroProfileData,
  getNewsItems,
  saveContactMessage,
  updateAboutInfo,
  updateAcademicProfile,
  updateContactInfo,
  updateCourses,
  updateNewsItems,
  updateProfile,
  uploadProfilePicture,
} from "../controllers/academicProfileController.js";
import isAdmin from "../middlewares/isAdmin.js";

const userRouter = express.Router();

userRouter.get("/user-data", authUser, getUserData);

userRouter.get("/profile-data", getHeroProfileData);
userRouter.put("/update-profile", authUser, isAdmin, updateProfile);
userRouter.post(
  "/upload-profile",
  authUser,
  isAdmin,
  upload.single("profilePicture"),
  uploadProfilePicture
);
userRouter.get("/academic-profile", getAcademicProfile);
userRouter.put("/academic-profile", authUser, isAdmin, updateAcademicProfile);

// In your userRoutes.js
userRouter.get("/about", getAboutInfo);
userRouter.put("/about", authUser, isAdmin, updateAboutInfo);

// In your userRoutes.js
userRouter.get("/news", getNewsItems);
userRouter.put("/news", authUser, isAdmin, updateNewsItems);
userRouter.delete("/news/:id", authUser, isAdmin, deleteNewsItem);

userRouter.get("/courses", getCourses);
userRouter.put("/courses", authUser, isAdmin, updateCourses);
userRouter.delete("/courses/:id", authUser, isAdmin, deleteCourse);

userRouter.get("/contact", getContactInfo);
userRouter.put("/contact", authUser, isAdmin, updateContactInfo);

userRouter.post("/messages", saveContactMessage);
userRouter.get("/messages", authUser, isAdmin, getContactMessages);
userRouter.delete(
  "/messages/:messageId",
  authUser,
  isAdmin,
  deleteContactMessage
);

export default userRouter;

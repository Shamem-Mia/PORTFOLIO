import express from "express";
import {
  getCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  getCertificatesByCategory,
} from "../controllers/certificateController.js";
import { uploadCertificate } from "../config/multerConfig.js";
import authUser from "../middlewares/userAuth.js";
import isAdmin from "../middlewares/isAdmin.js";

const certificateRouter = express.Router();

certificateRouter.get("/", getCertificates);
certificateRouter.get("/category/:category", getCertificatesByCategory);
certificateRouter.get("/:id", getCertificateById);
certificateRouter.post(
  "/",
  authUser,
  isAdmin,
  uploadCertificate.array("images", 5),
  createCertificate
);
certificateRouter.put(
  "/:id",
  authUser,
  isAdmin,
  uploadCertificate.array("images", 5),
  updateCertificate
);
certificateRouter.delete("/:id", authUser, isAdmin, deleteCertificate);

export default certificateRouter;

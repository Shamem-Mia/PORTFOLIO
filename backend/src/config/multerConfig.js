import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for profile pictures
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile-pictures",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

// Storage for achievement images
const achievementStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "achievements",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, height: 600, crop: "limit" }],
  },
});

// Storage for research papers (PDFs)
const researchStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "research-papers",
    resource_type: "raw", // Important for PDFs
    allowed_formats: ["pdf"],
    format: "pdf", // Ensures files are stored as PDFs
  },
});

// Create multer instances for different upload types
export const uploadProfile = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for profile pictures
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(
        new Error("Only image files are allowed for profile pictures!"),
        false
      );
    }
  },
});

export const uploadAchievement = multer({
  storage: achievementStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for achievement images
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for achievements!"), false);
    }
  },
});

export const uploadResearch = multer({
  storage: researchStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for research papers
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed for research papers!"), false);
    }
  },
});

// Storage for project images (multiple)
const projectStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "projects",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 800, crop: "limit" }],
  },
});

export const uploadProject = multer({
  storage: projectStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per image
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for projects!"), false);
    }
  },
});

// Storage for certificate images (multiple)
const certificateStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "certificates",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1000, height: 800, crop: "limit" }],
  },
});

export const uploadCertificate = multer({
  storage: certificateStorage,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB limit per image
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for certificates!"), false);
    }
  },
});

// Default export for backward compatibility
const upload = multer({ storage: profileStorage });
export default upload;

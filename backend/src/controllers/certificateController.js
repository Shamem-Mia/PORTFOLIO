import { v2 as cloudinary } from "cloudinary";
import { Certificate } from "../models/certificateModel.js";

export const getCertificates = async (req, res) => {
  try {
    const { category, featured, page = 1, limit = 12 } = req.query;

    let query = { owner: "admin" };

    if (category && category !== "all") {
      query.category = category;
    }

    if (featured === "true") {
      query.featured = true;
    }

    const certificates = await Certificate.find(query)
      .sort({ issueDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Certificate.countDocuments(query);

    res.status(200).json({
      success: true,
      data: certificates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCertificates: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching certificates",
    });
  }
};

export const getCertificatesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const certificates = await Certificate.find({
      owner: "admin",
      category,
    })
      .sort({ issueDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Certificate.countDocuments({
      owner: "admin",
      category,
    });

    res.status(200).json({
      success: true,
      data: certificates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCertificates: total,
      },
    });
  } catch (error) {
    console.error("Error fetching certificates by category:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching certificates",
    });
  }
};

export const getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    res.status(200).json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    console.error("Error fetching certificate:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid certificate ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while fetching certificate",
    });
  }
};

export const createCertificate = async (req, res) => {
  try {
    const {
      title,
      description,
      issuingOrganization,
      issueDate,
      expirationDate,
      category,
      skills,
      credentialId,
      credentialUrl,
      featured,
    } = req.body;

    // Validation
    if (!title || !description || !issuingOrganization || !issueDate) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, issuing organization, and issue date are required fields",
      });
    }

    const certificateData = {
      title: title.trim(),
      description: description.trim(),
      issuingOrganization: issuingOrganization.trim(),
      issueDate,
      category: category || "professional",
      skills: skills ? JSON.parse(skills) : [],
      credentialId: credentialId?.trim() || "",
      credentialUrl: credentialUrl?.trim() || "",
      featured: featured === "true",
      owner: "admin",
    };

    // Add expiration date if provided
    if (expirationDate) {
      certificateData.expirationDate = expirationDate;
    }

    // Handle multiple file uploads
    if (req.files && req.files.length > 0) {
      certificateData.images = req.files.map((file) => ({
        public_id: file.filename,
        url: file.path,
        caption: "",
      }));
    }

    const certificate = await Certificate.create(certificateData);

    res.status(201).json({
      success: true,
      data: certificate,
      message: "Certificate created successfully",
    });
  } catch (error) {
    console.error("Error creating certificate:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating certificate",
    });
  }
};

export const updateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      issuingOrganization,
      issueDate,
      expirationDate,
      category,
      skills,
      credentialId,
      credentialUrl,
      featured,
      existingImages,
    } = req.body;

    // Check if certificate exists
    const existingCertificate = await Certificate.findById(id);
    if (!existingCertificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    const updateData = {
      title: title ? title.trim() : existingCertificate.title,
      description: description
        ? description.trim()
        : existingCertificate.description,
      issuingOrganization: issuingOrganization
        ? issuingOrganization.trim()
        : existingCertificate.issuingOrganization,
      issueDate: issueDate || existingCertificate.issueDate,
      category: category || existingCertificate.category,
      skills: skills ? JSON.parse(skills) : existingCertificate.skills,
      credentialId:
        credentialId !== undefined
          ? credentialId.trim()
          : existingCertificate.credentialId,
      credentialUrl:
        credentialUrl !== undefined
          ? credentialUrl.trim()
          : existingCertificate.credentialUrl,
      featured:
        featured !== undefined
          ? featured === "true"
          : existingCertificate.featured,
    };

    // Handle expiration date
    if (expirationDate !== undefined) {
      updateData.expirationDate = expirationDate || null;
    }

    // Handle images - combine existing and new images
    let images = [];

    // Add existing images that are kept
    if (existingImages) {
      const keptImages = JSON.parse(existingImages);
      images = keptImages;
    }

    // Add new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        public_id: file.filename,
        url: file.path,
        caption: "",
      }));
      images = [...images, ...newImages];
    }

    if (images.length > 0) {
      updateData.images = images;
    }

    const certificate = await Certificate.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: certificate,
      message: "Certificate updated successfully",
    });
  } catch (error) {
    console.error("Error updating certificate:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid certificate ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating certificate",
    });
  }
};

export const deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findByIdAndDelete(id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    // Delete images from Cloudinary
    if (certificate.images && certificate.images.length > 0) {
      const deletePromises = certificate.images.map((image) =>
        cloudinary.uploader.destroy(image.public_id)
      );
      await Promise.all(deletePromises);
    }

    res.status(200).json({
      success: true,
      message: "Certificate deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting certificate:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid certificate ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while deleting certificate",
    });
  }
};

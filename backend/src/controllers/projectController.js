import { v2 as cloudinary } from "cloudinary";
import { Project } from "../models/projectModel.js";

export const getProjects = async (req, res) => {
  try {
    const { category, featured, page = 1, limit = 9 } = req.query;

    let query = { owner: "admin" };

    if (category && category !== "all") {
      query.category = category;
    }

    if (featured === "true") {
      query.featured = true;
    }

    const projects = await Project.find(query)
      .sort({ projectDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-detailedDescription");

    const total = await Project.countDocuments(query);

    res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProjects: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching projects",
    });
  }
};

export const getProjectsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 9 } = req.query;

    const projects = await Project.find({
      owner: "admin",
      category,
    })
      .sort({ projectDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-detailedDescription");

    const total = await Project.countDocuments({ owner: "admin", category });

    res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProjects: total,
      },
    });
  } catch (error) {
    console.error("Error fetching projects by category:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching projects",
    });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Error fetching project:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while fetching project",
    });
  }
};

export const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      detailedDescription,
      technologies,
      category,
      projectDate,
      teamMembers,
      githubLink,
      liveDemoLink,
      featured,
    } = req.body;

    // Validation
    if (!title || !description || !detailedDescription || !projectDate) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, detailed description, and project date are required fields",
      });
    }

    const projectData = {
      title: title.trim(),
      description: description.trim(),
      detailedDescription: detailedDescription.trim(),
      technologies: technologies ? JSON.parse(technologies) : [],
      category: category || "Undergraduate",
      projectDate,
      teamMembers: teamMembers ? JSON.parse(teamMembers) : [],
      githubLink: githubLink?.trim() || "",
      liveDemoLink: liveDemoLink?.trim() || "",
      featured: featured === "true",
      owner: "admin",
    };

    // Handle multiple file uploads
    if (req.files && req.files.length > 0) {
      projectData.images = req.files.map((file) => ({
        public_id: file.filename,
        url: file.path,
        caption: "",
      }));
    }

    const project = await Project.create(projectData);

    res.status(201).json({
      success: true,
      data: project,
      message: "Project created successfully",
    });
  } catch (error) {
    console.error("Error creating project:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating project",
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      detailedDescription,
      technologies,
      category,
      projectDate,
      teamMembers,
      githubLink,
      liveDemoLink,
      featured,
      existingImages,
    } = req.body;

    // Check if project exists
    const existingProject = await Project.findById(id);
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const updateData = {
      title: title ? title.trim() : existingProject.title,
      description: description
        ? description.trim()
        : existingProject.description,
      detailedDescription: detailedDescription
        ? detailedDescription.trim()
        : existingProject.detailedDescription,
      technologies: technologies
        ? JSON.parse(technologies)
        : existingProject.technologies,
      category: category || existingProject.category,
      projectDate: projectDate || existingProject.projectDate,
      teamMembers: teamMembers
        ? JSON.parse(teamMembers)
        : existingProject.teamMembers,
      githubLink:
        githubLink !== undefined
          ? githubLink.trim()
          : existingProject.githubLink,
      liveDemoLink:
        liveDemoLink !== undefined
          ? liveDemoLink.trim()
          : existingProject.liveDemoLink,
      featured:
        featured !== undefined ? featured === "true" : existingProject.featured,
    };

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

    const project = await Project.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: project,
      message: "Project updated successfully",
    });
  } catch (error) {
    console.error("Error updating project:", error);

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
        message: "Invalid project ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating project",
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Delete images from Cloudinary
    if (project.images && project.images.length > 0) {
      const deletePromises = project.images.map((image) =>
        cloudinary.uploader.destroy(image.public_id)
      );
      await Promise.all(deletePromises);
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while deleting project",
    });
  }
};

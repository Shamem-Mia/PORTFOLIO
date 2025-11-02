import { Research } from "../models/userInfoModel.js";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";

export const getResearchPapers = async (req, res) => {
  try {
    const researchPapers = await Research.find({ owner: "admin" }).sort({
      publishedDate: -1,
    });

    res.status(200).json({
      success: true,
      data: researchPapers,
    });
  } catch (error) {
    console.error("Error fetching research papers:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching research papers",
    });
  }
};

export const createResearchPaper = async (req, res) => {
  try {
    const { title, description, publishedDate, publisher, authors, doi, tags } =
      req.body;

    // Validation
    if (!title || !description || !publishedDate || !publisher) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, published date, and publisher are required fields",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "PDF file is required",
      });
    }

    // Parse array fields
    const authorsArray = Array.isArray(authors)
      ? authors.filter((author) => author && author.trim())
      : typeof authors === "string"
      ? [authors.trim()]
      : [];

    const tagsArray = Array.isArray(tags)
      ? tags.filter((tag) => tag && tag.trim())
      : typeof tags === "string"
      ? [tags.trim()]
      : [];

    const researchData = {
      title: title.trim(),
      description: description.trim(),
      publishedDate,
      publisher: publisher.trim(),
      authors: authorsArray,
      doi: doi ? doi.trim() : "",
      tags: tagsArray,
      owner: "admin",
      pdfFile: {
        public_id: req.file.filename,
        url: req.file.path,
      },
    };

    const researchPaper = await Research.create(researchData);

    res.status(201).json({
      success: true,
      data: researchPaper,
      message: "Research paper added successfully",
    });
  } catch (error) {
    console.error("Error creating research paper:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating research paper",
    });
  }
};

export const updateResearchPaper = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, publishedDate, publisher, authors, doi, tags } =
      req.body;

    // Check if research paper exists
    const existingResearch = await Research.findById(id);
    if (!existingResearch) {
      return res.status(404).json({
        success: false,
        message: "Research paper not found",
      });
    }

    // Parse array fields
    const authorsArray = Array.isArray(authors)
      ? authors.filter((author) => author && author.trim())
      : typeof authors === "string"
      ? [authors.trim()]
      : existingResearch.authors;

    const tagsArray = Array.isArray(tags)
      ? tags.filter((tag) => tag && tag.trim())
      : typeof tags === "string"
      ? [tags.trim()]
      : existingResearch.tags;

    const updateData = {
      title: title ? title.trim() : existingResearch.title,
      description: description
        ? description.trim()
        : existingResearch.description,
      publishedDate: publishedDate || existingResearch.publishedDate,
      publisher: publisher ? publisher.trim() : existingResearch.publisher,
      authors: authorsArray,
      doi: doi !== undefined ? doi.trim() : existingResearch.doi,
      tags: tagsArray,
    };

    // Handle file upload - if new file is uploaded, update the PDF
    if (req.file) {
      updateData.pdfFile = {
        public_id: req.file.filename,
        url: req.file.path,
      };

      // Optional: Delete old PDF from Cloudinary
      if (existingResearch.pdfFile?.public_id) {
        await cloudinary.uploader.destroy(existingResearch.pdfFile.public_id, {
          resource_type: "raw",
        });
      }
    }

    const researchPaper = await Research.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: researchPaper,
      message: "Research paper updated successfully",
    });
  } catch (error) {
    console.error("Error updating research paper:", error);

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
        message: "Invalid research paper ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating research paper",
    });
  }
};

export const deleteResearchPaper = async (req, res) => {
  try {
    const { id } = req.params;

    const researchPaper = await Research.findByIdAndDelete(id);

    if (!researchPaper) {
      return res.status(404).json({
        success: false,
        message: "Research paper not found",
      });
    }

    // Optional: Delete PDF from Cloudinary
    if (researchPaper.pdfFile?.public_id) {
      await cloudinary.uploader.destroy(researchPaper.pdfFile.public_id, {
        resource_type: "raw",
      });
    }

    res.status(200).json({
      success: true,
      message: "Research paper deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting research paper:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid research paper ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while deleting research paper",
    });
  }
};

export const downloadResearchPaper = async (req, res) => {
  try {
    const { id } = req.params;

    const researchPaper = await Research.findById(id);

    if (!researchPaper) {
      return res.status(404).json({
        success: false,
        message: "Research paper not found",
      });
    }

    if (!researchPaper.pdfFile?.url) {
      return res.status(404).json({
        success: false,
        message: "PDF file not found",
      });
    }

    // Fetch from Cloudinary
    const response = await axios({
      method: "GET",
      url: researchPaper.pdfFile.url,
      responseType: "stream",
    });

    // Set download headers
    const filename = `${researchPaper.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", response.headers["content-length"]);

    // Stream the file
    response.data.pipe(res);
  } catch (error) {
    console.error("Error downloading research paper:", error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Server error while downloading research paper",
      });
    }
  }
};

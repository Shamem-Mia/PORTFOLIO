import { Achievement } from "../models/userInfoModel.js";
import { v2 as cloudinary } from "cloudinary";

export const getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ owner: "admin" }).sort({
      date: -1,
    });

    res.status(200).json({
      success: true,
      data: achievements,
    });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching achievements",
    });
  }
};

export const createAchievement = async (req, res) => {
  try {
    const { title, description, date, place, event, position, category } =
      req.body;

    // Validation
    if (!title || !description || !date || !place || !event) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, date, place, and event are required fields",
      });
    }

    const achievementData = {
      title: title.trim(),
      description: description.trim(),
      date,
      place: place.trim(),
      event: event.trim(),
      position: position ? position.trim() : "",
      category: category || "academic",
      owner: "admin",
    };

    // Handle file upload
    if (req.file) {
      achievementData.photo = {
        public_id: req.file.filename,
        url: req.file.path,
      };
    }

    const achievement = await Achievement.create(achievementData);

    res.status(201).json({
      success: true,
      data: achievement,
      message: "Achievement created successfully",
    });
  } catch (error) {
    console.error("Error creating achievement:", error);

    // Handle duplicate key errors or validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating achievement",
    });
  }
};

export const updateAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, place, event, position, category } =
      req.body;

    // Check if achievement exists
    const existingAchievement = await Achievement.findById(id);
    if (!existingAchievement) {
      return res.status(404).json({
        success: false,
        message: "Achievement not found",
      });
    }

    const updateData = {
      title: title ? title.trim() : existingAchievement.title,
      description: description
        ? description.trim()
        : existingAchievement.description,
      date: date || existingAchievement.date,
      place: place ? place.trim() : existingAchievement.place,
      event: event ? event.trim() : existingAchievement.event,
      position:
        position !== undefined ? position.trim() : existingAchievement.position,
      category: category || existingAchievement.category,
    };

    // Handle file upload - if new file is uploaded, update the photo
    if (req.file) {
      updateData.photo = {
        public_id: req.file.filename,
        url: req.file.path,
      };

      //  Delete old image from Cloudinary
      if (existingAchievement.photo?.public_id) {
        await cloudinary.uploader.destroy(existingAchievement.photo.public_id);
      }
    }

    const achievement = await Achievement.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: achievement,
      message: "Achievement updated successfully",
    });
  } catch (error) {
    console.error("Error updating achievement:", error);

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
        message: "Invalid achievement ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating achievement",
    });
  }
};

export const deleteAchievement = async (req, res) => {
  try {
    const { id } = req.params;

    const achievement = await Achievement.findByIdAndDelete(id);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: "Achievement not found",
      });
    }

    // Optional: Delete image from Cloudinary
    if (achievement.photo?.public_id) {
      await cloudinary.uploader.destroy(achievement.photo.public_id);
    }

    res.status(200).json({
      success: true,
      message: "Achievement deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting achievement:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid achievement ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while deleting achievement",
    });
  }
};

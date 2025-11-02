import UserInfo from "../models/userInfoModel.js";

// hero section info

export const getHeroProfileData = async (req, res) => {
  try {
    const user = await UserInfo.findOne({ owner: "admin" }).select(
      "fullName adminEmail profilePicture position bio"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "profile data not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching academic profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching academic profile",
    });
  }
};

export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Check if user exists, if not create one
    let user = await UserInfo.findOne({ owner: "admin" });

    if (!user) {
      user = await UserInfo.create({
        owner: "admin",
        profilePicture: {
          url: req.file.path,
          public_id: req.file.filename || "default",
        },
      });
    } else {
      // Update existing user
      user = await UserInfo.findOneAndUpdate(
        { owner: "admin" },
        {
          profilePicture: {
            url: req.file.path,
            public_id: req.file.filename || "default",
          },
        },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      data: {
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, position, bio } = req.body;

    let user = await UserInfo.findOne({ owner: "admin" });

    if (!user) {
      // Create new user if none exists
      user = await UserInfo.create({
        owner: "admin",
        fullName,
        position,
        bio,
        profilePicture: {
          url: "/default-profile.png",
          public_id: "",
        },
      });
    } else {
      // Update existing user
      user = await UserInfo.findOneAndUpdate(
        { owner: "admin" },
        {
          fullName,
          position,
          bio,
        },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// academic profile update
export const getAcademicProfile = async (req, res) => {
  try {
    const user = await UserInfo.findOne({ owner: "admin" }).select(
      "education achievements researchFocus"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Academic profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        education: user.education || [],
        achievements: user.achievements || [],
        researchFocus: user.researchFocus || [],
      },
    });
  } catch (error) {
    console.error("Error fetching academic profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching academic profile",
    });
  }
};

export const updateAcademicProfile = async (req, res) => {
  try {
    const { education, achievements, researchFocus } = req.body;

    // Validate education data
    if (!Array.isArray(education)) {
      return res.status(400).json({
        success: false,
        message: "Education must be an array",
      });
    }

    for (const edu of education) {
      if (!edu.degree || !edu.institution || !edu.year) {
        return res.status(400).json({
          success: false,
          message:
            "All education entries must have degree, institution, and year",
        });
      }
    }

    // Validate achievements data
    if (!Array.isArray(achievements)) {
      return res.status(400).json({
        success: false,
        message: "Achievements must be an array",
      });
    }

    for (const ach of achievements) {
      if (!ach.title || !ach.organization || !ach.year) {
        return res.status(400).json({
          success: false,
          message:
            "All achievement entries must have title, organization, and year",
        });
      }
    }

    // Validate research focus data
    if (!Array.isArray(researchFocus)) {
      return res.status(400).json({
        success: false,
        message: "Research focus must be an array",
      });
    }

    for (const focus of researchFocus) {
      if (typeof focus !== "string" || !focus.trim()) {
        return res.status(400).json({
          success: false,
          message: "All research interests must be non-empty strings",
        });
      }
    }

    const updatedData = {
      education,
      achievements,
      researchFocus,
    };

    const user = await UserInfo.findOneAndUpdate(
      { owner: "admin" },
      updatedData,
      {
        new: true,
        runValidators: true,
        upsert: true, // Create if doesn't exist
      }
    ).select("education achievements researchFocus");

    res.status(200).json({
      success: true,
      data: {
        education: user.education,
        achievements: user.achievements,
        researchFocus: user.researchFocus,
      },
    });
  } catch (error) {
    console.error("Error updating academic profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating academic profile",
    });
  }
};
// In your userController.js
export const updateAboutInfo = async (req, res) => {
  try {
    const { about, philosophies, cvUrl } = req.body;

    const user = await UserInfo.findOneAndUpdate(
      { owner: "admin" },
      {
        about,
        philosophies: philosophies || [], // Handle philosophies array
        cvUrl,
      },
      { new: true, runValidators: true }
    ).select("about philosophies cvUrl");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        about: user.about || "",
        philosophies: user.philosophies || [],
        cvUrl: user.cvUrl || "",
      },
    });
  } catch (error) {
    console.error("Error updating about info:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// New controller to get about info
export const getAboutInfo = async (req, res) => {
  try {
    const user = await UserInfo.findOne({ owner: "admin" }).select(
      "about philosophies cvUrl"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        about: user.about || "",
        philosophies: user.philosophies || [],
        cvUrl: user.cvUrl || "",
      },
    });
  } catch (error) {
    console.error("Error fetching about info:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// In your userController.js
// @desc    Get news items
// @route   GET /api/users/news
// @access  Public
export const getNewsItems = async (req, res) => {
  try {
    const user = await UserInfo.findOne({ owner: "admin" }).select("newsItems");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Admin news configuration not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user.newsItems || [],
    });
  } catch (error) {
    console.error("Error fetching news items:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Update news items
// @route   PUT /api/users/news
// @access  Private (Admin only)
export const updateNewsItems = async (req, res) => {
  try {
    const { newsItems } = req.body;

    // Validate input
    if (!Array.isArray(newsItems)) {
      return res.status(400).json({
        success: false,
        message: "Invalid news items format",
      });
    }

    // Validate each news item
    for (const item of newsItems) {
      if (!item.title || !item.description || !item.date) {
        return res.status(400).json({
          success: false,
          message:
            "Title, description, and date are required for all news items",
        });
      }
    }

    const user = await UserInfo.findOneAndUpdate(
      { owner: "admin" },
      { newsItems: newsItems.filter((item) => !item.markedForDeletion) }, // Filter out items marked for deletion
      { new: true, runValidators: true, upsert: true }
    ).select("newsItems");

    res.status(200).json({
      success: true,
      data: user.newsItems,
    });
  } catch (error) {
    console.error("Error updating news items:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Delete a news item
// @route   DELETE /api/users/news/:id
// @access  Private (Admin only)
export const deleteNewsItem = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserInfo.findOne({ owner: "admin" });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Admin news configuration not found",
      });
    }

    // Filter out the item to be deleted
    user.newsItems = user.newsItems.filter(
      (item) => item._id.toString() !== id
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: "News item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting news item:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Get courses
// @route   GET /api/users/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    const user = await UserInfo.findOne({ owner: "admin" }).select("courses");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Admin courses configuration not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user.courses || [],
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Update courses
// @route   PUT /api/users/courses
// @access  Private (Admin only)
export const updateCourses = async (req, res) => {
  try {
    const { courses } = req.body;

    console.log("courses", courses);
    console.log("hi");

    // Validate input
    if (!Array.isArray(courses)) {
      return res.status(400).json({
        success: false,
        message: "Courses must be an array",
      });
    }

    // Validate each course with new schema
    for (const course of courses) {
      if (!course.title || !course.platform || !course.category) {
        return res.status(400).json({
          success: false,
          message: "Title, platform, and category are required for all courses",
        });
      }

      // Validate category enum
      const validCategories = [
        "Technical",
        "Soft Skills",
        "Creative",
        "Business",
      ];
      if (!validCategories.includes(course.category)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid category. Must be one of: Technical, Soft Skills, Creative, Business",
        });
      }
    }

    const user = await UserInfo.findOneAndUpdate(
      { owner: "admin" },
      { courses: courses.filter((course) => !course.markedForDeletion) },
      { new: true, runValidators: true, upsert: true }
    ).select("courses");

    res.status(200).json({
      success: true,
      data: user.courses,
    });
  } catch (error) {
    console.error("Error updating courses:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Delete a course
// @route   DELETE /api/users/courses/:id
// @access  Private (Admin only)
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserInfo.findOne({ owner: "admin" });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Admin courses configuration not found",
      });
    }

    // Filter out the course to be deleted
    user.courses = user.courses.filter(
      (course) => course._id.toString() !== id
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// contact and message part

export const getContactInfo = async (req, res) => {
  try {
    const user = await UserInfo.findOne({ owner: "admin" }).select(
      "adminEmail phone officeLocation officeHours"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Contact information not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        adminEmail: user.adminEmail || "",
        phone: user.phone || "",
        officeLocation: user.officeLocation || {
          building: "",
          room: "",
          address: "",
          city: "",
          state: "",
          zip: "",
        },
        officeHours: Array.isArray(user.officeHours) ? user.officeHours : [],
      },
    });
  } catch (error) {
    console.error("Error fetching contact info:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching contact information",
    });
  }
};

export const updateContactInfo = async (req, res) => {
  try {
    const { adminEmail, phone, officeLocation, officeHours } = req.body;

    // Validate office hours structure
    if (officeHours && Array.isArray(officeHours)) {
      for (const hour of officeHours) {
        if (!hour.day || !hour.hours) {
          return res.status(400).json({
            success: false,
            message: "Each office hour must have a day and hours specified",
          });
        }
      }
    }

    const user = await UserInfo.findOneAndUpdate(
      { owner: "admin" },
      {
        adminEmail,
        phone,
        officeLocation: officeLocation || {
          building: "",
          room: "",
          address: "",
          city: "",
          state: "",
          zip: "",
        },
        officeHours: Array.isArray(officeHours) ? officeHours : [],
      },
      { new: true, upsert: true, runValidators: true }
    ).select("adminEmail phone officeLocation officeHours");

    res.status(200).json({
      success: true,
      data: {
        adminEmail: user.adminEmail || "",
        phone: user.phone || "",
        officeLocation: user.officeLocation || {
          building: "",
          room: "",
          address: "",
          city: "",
          state: "",
          zip: "",
        },
        officeHours: Array.isArray(user.officeHours) ? user.officeHours : [],
      },
    });
  } catch (error) {
    console.error("Error updating contact info:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating contact information",
    });
  }
};

// controllers/messageController.js
export const saveContactMessage = async (req, res) => {
  try {
    const { name, msgEmail, subject, message } = req.body;

    // Basic validation
    if (!name || !msgEmail || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(msgEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const newMessage = {
      name,
      msgEmail,
      subject,
      message,
      createdAt: new Date(),
      read: false,
    };

    await UserInfo.findOneAndUpdate(
      { owner: "admin" },
      {
        $push: {
          contactMessages: newMessage,
        },
      },
      { new: true, upsert: true }
    );

    res.status(201).json({
      success: true,
      message: "Message received successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error saving contact message:", error);
    res.status(500).json({
      success: false,
      message: "Server error while saving message",
    });
  }
};

export const getContactMessages = async (req, res) => {
  try {
    const user = await UserInfo.findOne({ owner: "admin" })
      .select("contactMessages")
      .sort({ "contactMessages.createdAt": -1 });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Ensure we always return an array, even if contactMessages is undefined
    const messages = user.contactMessages || [];

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching messages",
    });
  }
};

export const deleteContactMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const user = await UserInfo.findOneAndUpdate(
      { owner: "admin" },
      { $pull: { contactMessages: { _id: messageId } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting message",
    });
  }
};

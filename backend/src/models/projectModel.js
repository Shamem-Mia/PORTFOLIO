import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
    },
    detailedDescription: {
      type: String,
      required: [true, "Detailed description is required"],
      trim: true,
    },
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      required: true,
      enum: ["Undergraduate", "personal", "professional", "research", "other"],
      default: "Undergraduate",
    },
    projectDate: {
      type: Date,
      required: [true, "Project date is required"],
    },
    teamMembers: [
      {
        name: String,
        role: String,
      },
    ],
    githubLink: {
      type: String,
      trim: true,
    },
    liveDemoLink: {
      type: String,
      trim: true,
    },
    images: [
      {
        public_id: String,
        url: String,
        caption: String,
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: String,
      default: "admin",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
projectSchema.index({ category: 1, projectDate: -1 });
projectSchema.index({ featured: -1, projectDate: -1 });

export const Project = mongoose.model("Project", projectSchema);

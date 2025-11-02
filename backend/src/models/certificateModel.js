import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Certificate title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Certificate description is required"],
      trim: true,
    },
    issuingOrganization: {
      type: String,
      required: [true, "Issuing organization is required"],
      trim: true,
    },
    issueDate: {
      type: Date,
      required: [true, "Issue date is required"],
    },
    expirationDate: {
      type: Date,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "academic",
        "professional",
        "online-course",
        "workshop",
        "competition",
        "other",
      ],
      default: "professional",
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    credentialId: {
      type: String,
      trim: true,
    },
    credentialUrl: {
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
certificateSchema.index({ category: 1, issueDate: -1 });
certificateSchema.index({ issuingOrganization: 1 });
certificateSchema.index({ featured: -1, issueDate: -1 });

export const Certificate = mongoose.model("Certificate", certificateSchema);

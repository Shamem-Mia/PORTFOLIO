import mongoose from "mongoose";

const UserInfoSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    owner: {
      type: String,
      default: "admin",
    },
    adminEmail: {
      type: String,
      default: "",
    },
    msgEmail: {
      type: String,
      require: true,
    },

    profilePicture: {
      public_id: String,
      url: String,
    },
    position: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    education: [
      {
        degree: String,
        institution: String,
        year: String,
      },
    ],

    about: {
      type: String,
      default: "type your about info",
    },
    philosophies: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        icon: {
          type: String,
          default: "GraduationCap",
        },
        order: {
          type: Number,
          default: 0,
        },
      },
    ],
    cvUrl: {
      type: String,
      default: "",
    },
    newsItems: [
      {
        date: String,
        title: String,
        description: String,
      },
    ],
    courses: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        platform: {
          type: String,
          required: true,
          trim: true,
        },
        category: {
          type: String,
          required: true,
          enum: ["Technical", "Soft Skills", "Creative", "Business"],
          default: "Technical",
        },
        skillsLearned: {
          type: String,
          trim: true,
        },
        completionDate: {
          type: String, // Store as "YYYY-MM" format
          trim: true,
        },
        certificateLink: {
          type: String,
          trim: true,
        },
      },
    ],
    phone: String,
    officeLocation: {
      building: String,
      room: String,
      address: String,
      city: String,
    },
    officeHours: [
      {
        day: String,
        hours: String,
        byAppointment: Boolean,
      },
    ],
    contactMessages: [
      {
        name: String,
        msgEmail: String,
        subject: String,
        message: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const AchievementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    photo: {
      public_id: String,
      url: String,
    },
    date: {
      type: Date,
      required: true,
    },
    place: {
      type: String,
      required: true,
    },
    event: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: ["academic", "sports", "cultural", "competition", "other"],
      default: "academic",
    },
    owner: {
      type: String,
      default: "admin",
    },
  },
  { timestamps: true }
);

const ResearchSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    pdfFile: {
      public_id: String,
      url: String,
    },
    publishedDate: {
      type: Date,
      required: true,
    },
    publisher: {
      type: String,
      required: true,
    },
    authors: [String],
    doi: {
      type: String,
      default: "",
    },
    tags: [String],
    owner: {
      type: String,
      default: "admin",
    },
  },
  { timestamps: true }
);

const Achievement = mongoose.model("Achievement", AchievementSchema);
const Research = mongoose.model("Research", ResearchSchema);

export { UserInfo, Achievement, Research };

const UserInfo = mongoose.model("UserInfo", UserInfoSchema);
export default UserInfo;

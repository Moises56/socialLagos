import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IContentProject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  niche: string;
  description?: string;
  config: {
    tone: "educational" | "entertainment" | "inspirational" | "controversial" | "storytelling";
    targetAudience: string;
    language: string;
    contentPillars: string[];
    brandVoice?: string;
    avoidTopics?: string[];
  };
  socialAccountIds: mongoose.Types.ObjectId[];
  status: "active" | "paused" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

const contentProjectSchema = new Schema<IContentProject>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    niche: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    config: {
      tone: {
        type: String,
        enum: ["educational", "entertainment", "inspirational", "controversial", "storytelling"],
        required: true,
      },
      targetAudience: { type: String, required: true, maxlength: 200 },
      language: { type: String, default: "es" },
      contentPillars: {
        type: [String],
        validate: [
          (val: string[]) => val.length >= 1 && val.length <= 10,
          "contentPillars debe tener entre 1 y 10 elementos",
        ],
      },
      brandVoice: { type: String, maxlength: 500 },
      avoidTopics: [String],
    },
    socialAccountIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "SocialAccount",
      },
    ],
    status: {
      type: String,
      enum: ["active", "paused", "archived"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

contentProjectSchema.index({ userId: 1, status: 1 });

const ContentProject: Model<IContentProject> =
  mongoose.models.ContentProject ||
  mongoose.model<IContentProject>("ContentProject", contentProjectSchema);

export default ContentProject;

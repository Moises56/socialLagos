import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IGeneratedContent extends Document {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  contentType: "reel" | "video" | "image" | "carousel" | "story";
  content: {
    script?: string;
    hook?: string;
    caption: string;
    hashtags: string[];
    callToAction?: string;
    mediaUrls: Array<{
      type: "image" | "video" | "audio";
      url: string;
      thumbnailUrl?: string;
      durationSeconds?: number;
      width?: number;
      height?: number;
      sizeBytes: number;
    }>;
    voiceover?: {
      url: string;
      text: string;
      voice: string;
      durationSeconds: number;
    };
    subtitles?: {
      url: string;
      language: string;
    };
  };
  platformVariants: Array<{
    platform: "facebook" | "tiktok" | "instagram";
    caption: string;
    hashtags: string[];
    mediaUrl?: string;
    aspectRatio: "9:16" | "1:1" | "16:9" | "4:5";
    maxDuration?: number;
  }>;
  generation: {
    promptUsed: string;
    model: string;
    tokensUsed: number;
    costUSD: number;
    generatedAt: Date;
  };
  status: "generating" | "draft" | "ready" | "scheduled" | "published" | "failed";
  qualityScore?: {
    overall: number;
    hookStrength: number;
    captionQuality: number;
    hashtagRelevance: number;
    estimatedReach: "low" | "medium" | "high";
  };
  createdAt: Date;
  updatedAt: Date;
}

const generatedContentSchema = new Schema<IGeneratedContent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "ContentProject",
      required: true,
      index: true,
    },
    contentType: {
      type: String,
      enum: ["reel", "video", "image", "carousel", "story"],
      required: true,
    },
    content: {
      script: String,
      hook: String,
      caption: { type: String, required: true },
      hashtags: [String],
      callToAction: String,
      mediaUrls: [
        {
          type: { type: String, enum: ["image", "video", "audio"], required: true },
          url: { type: String, required: true },
          thumbnailUrl: String,
          durationSeconds: Number,
          width: Number,
          height: Number,
          sizeBytes: { type: Number, required: true },
        },
      ],
      voiceover: {
        url: String,
        text: String,
        voice: String,
        durationSeconds: Number,
      },
      subtitles: {
        url: String,
        language: String,
      },
    },
    platformVariants: [
      {
        platform: {
          type: String,
          enum: ["facebook", "tiktok", "instagram"],
          required: true,
        },
        caption: { type: String, required: true },
        hashtags: [String],
        mediaUrl: String,
        aspectRatio: {
          type: String,
          enum: ["9:16", "1:1", "16:9", "4:5"],
          required: true,
        },
        maxDuration: Number,
      },
    ],
    generation: {
      promptUsed: { type: String, required: true },
      model: { type: String, required: true },
      tokensUsed: { type: Number, required: true },
      costUSD: { type: Number, required: true },
      generatedAt: { type: Date, required: true },
    },
    status: {
      type: String,
      enum: ["generating", "draft", "ready", "scheduled", "published", "failed"],
      default: "generating",
    },
    qualityScore: {
      overall: Number,
      hookStrength: Number,
      captionQuality: Number,
      hashtagRelevance: Number,
      estimatedReach: { type: String, enum: ["low", "medium", "high"] },
    },
  },
  {
    timestamps: true,
  }
);

generatedContentSchema.index({ userId: 1, status: 1 });
generatedContentSchema.index({ projectId: 1, createdAt: -1 });

const GeneratedContent: Model<IGeneratedContent> =
  mongoose.models.GeneratedContent ||
  mongoose.model<IGeneratedContent>("GeneratedContent", generatedContentSchema);

export default GeneratedContent;

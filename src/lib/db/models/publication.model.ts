import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IPublication extends Document {
  userId: mongoose.Types.ObjectId;
  contentId?: mongoose.Types.ObjectId;
  socialAccountId: mongoose.Types.ObjectId;
  platform: "facebook" | "tiktok" | "instagram";
  scheduledAt?: Date;
  publishedAt?: Date;
  platformPostId?: string;
  platformPostUrl?: string;
  status: "queued" | "scheduled" | "publishing" | "published" | "failed";
  errorMessage?: string;
  retryCount: number;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    watchTimeSeconds: number;
    avgWatchPercent: number;
    reachUnique: number;
    impressions: number;
    engagementRate: number;
    lastSyncAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const publicationSchema = new Schema<IPublication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    contentId: {
      type: Schema.Types.ObjectId,
      ref: "GeneratedContent",
      index: true,
      sparse: true,
    },
    socialAccountId: {
      type: Schema.Types.ObjectId,
      ref: "SocialAccount",
      required: true,
    },
    platform: {
      type: String,
      enum: ["facebook", "tiktok", "instagram"],
      required: true,
    },
    scheduledAt: Date,
    publishedAt: Date,
    platformPostId: { type: String, index: true, sparse: true },
    platformPostUrl: String,
    status: {
      type: String,
      enum: ["queued", "scheduled", "publishing", "published", "failed"],
      default: "queued",
    },
    errorMessage: String,
    retryCount: { type: Number, default: 0 },
    metrics: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
      watchTimeSeconds: { type: Number, default: 0 },
      avgWatchPercent: { type: Number, default: 0 },
      reachUnique: { type: Number, default: 0 },
      impressions: { type: Number, default: 0 },
      engagementRate: { type: Number, default: 0 },
      lastSyncAt: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
  }
);

publicationSchema.index({ userId: 1, status: 1 });
publicationSchema.index({ scheduledAt: 1, status: 1 });

const Publication: Model<IPublication> =
  mongoose.models.Publication ||
  mongoose.model<IPublication>("Publication", publicationSchema);

export default Publication;

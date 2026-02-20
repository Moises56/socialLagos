import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IMetricsSnapshot extends Document {
  socialAccountId: mongoose.Types.ObjectId;
  date: Date;
  followers: number;
  followersGrowth: number;
  totalViews: number;
  totalWatchMinutes: number;
  avgEngagementRate: number;
  postsPublished: number;
  topContentId?: mongoose.Types.ObjectId;
  byContentType: {
    reels: { views: number; engagement: number };
    videos: { views: number; engagement: number };
    images: { views: number; engagement: number };
  };
  createdAt: Date;
}

const metricsSnapshotSchema = new Schema<IMetricsSnapshot>(
  {
    socialAccountId: {
      type: Schema.Types.ObjectId,
      ref: "SocialAccount",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    followers: { type: Number, default: 0 },
    followersGrowth: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    totalWatchMinutes: { type: Number, default: 0 },
    avgEngagementRate: { type: Number, default: 0 },
    postsPublished: { type: Number, default: 0 },
    topContentId: {
      type: Schema.Types.ObjectId,
      ref: "GeneratedContent",
    },
    byContentType: {
      reels: {
        views: { type: Number, default: 0 },
        engagement: { type: Number, default: 0 },
      },
      videos: {
        views: { type: Number, default: 0 },
        engagement: { type: Number, default: 0 },
      },
      images: {
        views: { type: Number, default: 0 },
        engagement: { type: Number, default: 0 },
      },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

metricsSnapshotSchema.index({ socialAccountId: 1, date: -1 });
metricsSnapshotSchema.index(
  { date: 1 },
  { expireAfterSeconds: 365 * 24 * 60 * 60 }
);

const MetricsSnapshot: Model<IMetricsSnapshot> =
  mongoose.models.MetricsSnapshot ||
  mongoose.model<IMetricsSnapshot>("MetricsSnapshot", metricsSnapshotSchema);

export default MetricsSnapshot;

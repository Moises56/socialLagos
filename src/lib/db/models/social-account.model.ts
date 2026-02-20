import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ISocialAccount extends Document {
  userId: mongoose.Types.ObjectId;
  platform: "facebook" | "tiktok" | "instagram";
  platformAccountId: string;
  accountName: string;
  accountType: "page" | "profile" | "business";
  avatarUrl?: string;
  auth: {
    accessToken: string;
    refreshToken?: string;
    tokenExpiresAt: Date;
    scopes: string[];
  };
  monetization: {
    status: "not_eligible" | "in_progress" | "eligible" | "active";
    currentFollowers: number;
    currentViews30d: number;
    currentWatchMinutes60d: number;
    targetFollowers: number;
    targetViews: number;
    targetWatchMinutes: number;
    estimatedEligibilityDate?: Date;
    lastSyncAt: Date;
  };
  recentSnapshots: Array<{
    date: Date;
    followers: number;
    views: number;
    watchMinutes: number;
    engagementRate: number;
  }>;
  isActive: boolean;
  connectedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const socialAccountSchema = new Schema<ISocialAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    platform: {
      type: String,
      enum: ["facebook", "tiktok", "instagram"],
      required: true,
    },
    platformAccountId: {
      type: String,
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    accountType: {
      type: String,
      enum: ["page", "profile", "business"],
      required: true,
    },
    avatarUrl: String,
    auth: {
      accessToken: { type: String, required: true },
      refreshToken: String,
      tokenExpiresAt: { type: Date, required: true },
      scopes: [String],
    },
    monetization: {
      status: {
        type: String,
        enum: ["not_eligible", "in_progress", "eligible", "active"],
        default: "not_eligible",
      },
      currentFollowers: { type: Number, default: 0 },
      currentViews30d: { type: Number, default: 0 },
      currentWatchMinutes60d: { type: Number, default: 0 },
      targetFollowers: { type: Number, default: 10000 },
      targetViews: { type: Number, default: 100000 },
      targetWatchMinutes: { type: Number, default: 600000 },
      estimatedEligibilityDate: Date,
      lastSyncAt: { type: Date, default: Date.now },
    },
    recentSnapshots: {
      type: [
        {
          date: Date,
          followers: Number,
          views: Number,
          watchMinutes: Number,
          engagementRate: Number,
        },
      ],
      validate: [
        (val: unknown[]) => val.length <= 30,
        "recentSnapshots no puede exceder 30 entradas",
      ],
    },
    isActive: { type: Boolean, default: true },
    connectedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

socialAccountSchema.index(
  { platform: 1, platformAccountId: 1 },
  { unique: true }
);
socialAccountSchema.index({ userId: 1, platform: 1 });

const SocialAccount: Model<ISocialAccount> =
  mongoose.models.SocialAccount ||
  mongoose.model<ISocialAccount>("SocialAccount", socialAccountSchema);

export default SocialAccount;

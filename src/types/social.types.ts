import type { Platform } from "@/lib/utils/constants";

export interface MonetizationStatus {
  status: "not_eligible" | "in_progress" | "eligible" | "active";
  currentFollowers: number;
  currentViews30d: number;
  currentWatchMinutes60d: number;
  targetFollowers: number;
  targetViews: number;
  targetWatchMinutes: number;
  estimatedEligibilityDate?: Date;
  lastSyncAt: Date;
}

export interface MetricsSnapshot {
  date: Date;
  followers: number;
  views: number;
  watchMinutes: number;
  engagementRate: number;
}

export interface SocialAccount {
  _id: string;
  userId: string;
  platform: Platform;
  platformAccountId: string;
  accountName: string;
  accountType: "page" | "profile" | "business";
  avatarUrl?: string;
  monetization: MonetizationStatus;
  recentSnapshots: MetricsSnapshot[];
  isActive: boolean;
  connectedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicationMetrics {
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
}

export interface Publication {
  _id: string;
  userId: string;
  contentId: string;
  socialAccountId: string;
  platform: Platform;
  scheduledAt?: Date;
  publishedAt?: Date;
  platformPostId?: string;
  platformPostUrl?: string;
  status: "queued" | "scheduled" | "publishing" | "published" | "failed";
  errorMessage?: string;
  retryCount: number;
  metrics: PublicationMetrics;
  createdAt: Date;
  updatedAt: Date;
}

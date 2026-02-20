import type { Platform } from "@/lib/utils/constants";

export interface OAuthUrl {
  url: string;
  state: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scopes: string[];
}

export interface PlatformAccount {
  platformAccountId: string;
  accountName: string;
  accountType: "page" | "profile" | "business";
  avatarUrl?: string;
  /** Page-specific access token (Facebook Pages return their own token) */
  pageAccessToken?: string;
}

export interface PlatformContent {
  caption: string;
  hashtags: string[];
  mediaUrl?: string;
  mediaType?: "image" | "video";
  aspectRatio?: string;
  /** The platform-specific account/page ID for targeting the publish endpoint */
  accountId?: string;
}

export interface PublishResult {
  platformPostId: string;
  platformPostUrl: string;
}

export interface PostMetrics {
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
}

export interface AccountMetrics {
  followers: number;
  followersGrowth: number;
  totalViews: number;
  totalWatchMinutes: number;
  avgEngagementRate: number;
}

export interface ISocialPlatform {
  platform: Platform;
  getAuthUrl(userId: string, redirectUri: string): Promise<OAuthUrl>;
  handleCallback(code: string, redirectUri: string): Promise<TokenPair>;
  refreshToken(refreshToken: string): Promise<TokenPair>;
  getAccount(accessToken: string): Promise<PlatformAccount>;
  publishContent(accessToken: string, content: PlatformContent): Promise<PublishResult>;
  getPostMetrics(accessToken: string, postId: string): Promise<PostMetrics>;
  getAccountMetrics(accessToken: string, accountId: string): Promise<AccountMetrics>;
}

export interface DailyMetricsSnapshot {
  _id: string;
  socialAccountId: string;
  date: Date;
  followers: number;
  followersGrowth: number;
  totalViews: number;
  totalWatchMinutes: number;
  avgEngagementRate: number;
  postsPublished: number;
  topContentId?: string;
  byContentType: {
    reels: { views: number; engagement: number };
    videos: { views: number; engagement: number };
    images: { views: number; engagement: number };
  };
}

export interface AnalyticsSummary {
  totalFollowers: number;
  followersGrowth: number;
  totalViews: number;
  totalEngagement: number;
  avgEngagementRate: number;
  postsPublished: number;
  topPerformingContent: string[];
}

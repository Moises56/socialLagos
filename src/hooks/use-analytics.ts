"use client";

import { useState, useEffect, useCallback } from "react";

export interface AnalyticsAccount {
  id: string;
  platform: string;
  accountName: string;
  avatarUrl?: string;
  monetization: {
    status: string;
    currentFollowers: number;
    currentViews30d: number;
    currentWatchMinutes60d: number;
  };
}

export interface AnalyticsPublication {
  id: string;
  platform: string;
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
  };
  publishedAt: string;
  platformPostUrl?: string;
}

export interface AnalyticsSnapshot {
  id: string;
  accountId: string;
  date: string;
  followers: number;
  followersGrowth: number;
  totalViews: number;
  totalWatchMinutes: number;
  avgEngagementRate: number;
  postsPublished: number;
  byContentType: {
    reels: { views: number; engagement: number };
    videos: { views: number; engagement: number };
    images: { views: number; engagement: number };
  };
}

export interface AnalyticsData {
  accounts: AnalyticsAccount[];
  publications: AnalyticsPublication[];
  snapshots: AnalyticsSnapshot[];
}

export function useAnalytics(accountId?: string, days = 30) {
  const [data, setData] = useState<AnalyticsData>({
    accounts: [],
    publications: [],
    snapshots: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ days: days.toString() });
      if (accountId) params.set("accountId", accountId);
      const res = await fetch(`/api/metrics?${params.toString()}`);
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message ?? "Error al cargar métricas");
        return;
      }
      setData(json.data ?? { accounts: [], publications: [], snapshots: [] });
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, [accountId, days]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { ...data, loading, error, refetch: fetchAnalytics };
}

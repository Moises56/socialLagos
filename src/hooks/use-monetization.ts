"use client";

import { useState, useEffect, useCallback } from "react";

export interface MilestoneData {
  metric: string;
  current: number;
  target: number;
  progress: number;
  estimatedDays: number | null;
}

export interface MonetizationProjection {
  accountId: string;
  accountName: string;
  platform: string;
  avatarUrl?: string;
  monetizationStatus: string;
  overallProgress: number;
  followersProgress: number;
  viewsProgress: number;
  watchMinutesProgress: number;
  followersGrowthRate: number;
  viewsGrowthRate: number;
  estimatedDaysToEligibility: number | null;
  estimatedDate: string | null;
  isEligible: boolean;
  milestones: MilestoneData[];
}

export function useMonetization() {
  const [projections, setProjections] = useState<MonetizationProjection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/metrics/monetization");
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message ?? "Error al cargar proyecciones");
        return;
      }
      setProjections(json.data ?? []);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjections();
  }, [fetchProjections]);

  return { projections, loading, error, refetch: fetchProjections };
}

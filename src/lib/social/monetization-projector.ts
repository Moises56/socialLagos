import { MONETIZATION_REQUIREMENTS } from "@/lib/utils/constants";
import type { Platform } from "@/lib/utils/constants";

interface MonetizationData {
  platform: Platform;
  currentFollowers: number;
  currentViews30d: number;
  currentWatchMinutes60d: number;
  targetFollowers: number;
  targetViews: number;
  targetWatchMinutes: number;
  recentSnapshots: Array<{
    date: string | Date;
    followers: number;
    views: number;
    watchMinutes: number;
  }>;
}

interface Projection {
  platform: Platform;
  overallProgress: number;
  followersProgress: number;
  viewsProgress: number;
  watchMinutesProgress: number;
  followersGrowthRate: number;
  viewsGrowthRate: number;
  estimatedDaysToEligibility: number | null;
  estimatedDate: Date | null;
  isEligible: boolean;
  milestones: Array<{
    metric: string;
    current: number;
    target: number;
    progress: number;
    estimatedDays: number | null;
  }>;
}

function calculateGrowthRate(
  snapshots: Array<{ date: string | Date; value: number }>
): number {
  if (snapshots.length < 2) return 0;

  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const days =
    (new Date(last.date).getTime() - new Date(first.date).getTime()) /
    (1000 * 60 * 60 * 24);

  if (days <= 0) return 0;

  const growth = last.value - first.value;
  return growth / days; // daily growth rate
}

function daysToTarget(current: number, target: number, dailyRate: number): number | null {
  if (current >= target) return 0;
  if (dailyRate <= 0) return null;
  return Math.ceil((target - current) / dailyRate);
}

export function calculateProjection(data: MonetizationData): Projection {
  const requirements = MONETIZATION_REQUIREMENTS[data.platform];

  const followersTarget =
    "followers" in requirements ? requirements.followers : data.targetFollowers;

  // For Facebook Stars, views and watch minutes are not required
  const isFacebookStars = data.platform === "facebook";
  const viewsTarget = isFacebookStars
    ? 0
    : "views30d" in requirements
      ? requirements.views30d
      : data.targetViews;
  const watchTarget = isFacebookStars
    ? 0
    : "watchMinutes60d" in requirements
      ? requirements.watchMinutes60d
      : data.targetWatchMinutes;

  const followersProgress =
    followersTarget > 0
      ? Math.min(100, (data.currentFollowers / followersTarget) * 100)
      : 100;
  const viewsProgress =
    viewsTarget > 0
      ? Math.min(100, (data.currentViews30d / viewsTarget) * 100)
      : 100;
  const watchProgress =
    watchTarget > 0
      ? Math.min(100, (data.currentWatchMinutes60d / watchTarget) * 100)
      : 100;

  // Calculate growth rates from snapshots
  const followersGrowthRate = calculateGrowthRate(
    data.recentSnapshots.map((s) => ({
      date: s.date,
      value: s.followers,
    }))
  );
  const viewsGrowthRate = calculateGrowthRate(
    data.recentSnapshots.map((s) => ({
      date: s.date,
      value: s.views,
    }))
  );
  const watchGrowthRate = calculateGrowthRate(
    data.recentSnapshots.map((s) => ({
      date: s.date,
      value: s.watchMinutes,
    }))
  );

  const followersDays = daysToTarget(
    data.currentFollowers,
    followersTarget,
    followersGrowthRate
  );
  const viewsDays = daysToTarget(
    data.currentViews30d,
    viewsTarget,
    viewsGrowthRate
  );
  const watchDays = daysToTarget(
    data.currentWatchMinutes60d,
    watchTarget,
    watchGrowthRate
  );

  // Max of all required days
  const allDays = [followersDays, viewsDays, watchDays].filter(
    (d): d is number => d !== null
  );
  const estimatedDays =
    allDays.length > 0 ? Math.max(...allDays) : null;

  const isEligible =
    followersProgress >= 100 &&
    viewsProgress >= 100 &&
    watchProgress >= 100;

  // Build milestones based on platform
  const milestones: Array<{
    metric: string;
    current: number;
    target: number;
    progress: number;
    estimatedDays: number | null;
  }> = [];

  milestones.push({
    metric: "Seguidores",
    current: data.currentFollowers,
    target: followersTarget,
    progress: followersProgress,
    estimatedDays: followersDays,
  });

  if (isFacebookStars) {
    // Stars: 500 followers for 30 consecutive days
    // We can't track consecutive days via API, show as milestone
    const consecutiveDays = MONETIZATION_REQUIREMENTS.facebook.consecutiveDays;
    milestones.push({
      metric: `${consecutiveDays} días consecutivos con ${followersTarget}+ seguidores`,
      current: data.currentFollowers >= followersTarget ? 1 : 0,
      target: 1,
      progress: data.currentFollowers >= followersTarget ? 100 : 0,
      estimatedDays: null,
    });
  } else {
    if (viewsTarget > 0) {
      milestones.push({
        metric: "Vistas (30d)",
        current: data.currentViews30d,
        target: viewsTarget,
        progress: viewsProgress,
        estimatedDays: viewsDays,
      });
    }
    if (watchTarget > 0) {
      milestones.push({
        metric: "Minutos vistos (60d)",
        current: data.currentWatchMinutes60d,
        target: watchTarget,
        progress: watchProgress,
        estimatedDays: watchDays,
      });
    }
  }

  const overallProgress =
    milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length;

  return {
    platform: data.platform,
    overallProgress,
    followersProgress,
    viewsProgress,
    watchMinutesProgress: watchProgress,
    followersGrowthRate,
    viewsGrowthRate,
    estimatedDaysToEligibility: isEligible ? 0 : estimatedDays,
    estimatedDate:
      isEligible || estimatedDays === null
        ? isEligible
          ? new Date()
          : null
        : new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000),
    isEligible,
    milestones,
  };
}

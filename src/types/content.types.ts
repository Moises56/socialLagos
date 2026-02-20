import type { Platform, ContentType, Tone } from "@/lib/utils/constants";

export interface ContentProject {
  _id: string;
  userId: string;
  name: string;
  niche: string;
  description?: string;
  config: {
    tone: Tone;
    targetAudience: string;
    language: string;
    contentPillars: string[];
    brandVoice?: string;
    avoidTopics?: string[];
  };
  socialAccountIds: string[];
  status: "active" | "paused" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaItem {
  type: "image" | "video" | "audio";
  url: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  width?: number;
  height?: number;
  sizeBytes: number;
}

export interface PlatformVariant {
  platform: Platform;
  caption: string;
  hashtags: string[];
  mediaUrl?: string;
  aspectRatio: "9:16" | "1:1" | "16:9" | "4:5";
  maxDuration?: number;
}

export interface QualityScore {
  overall: number;
  hookStrength: number;
  captionQuality: number;
  hashtagRelevance: number;
  estimatedReach: "low" | "medium" | "high";
}

export interface GeneratedContent {
  _id: string;
  userId: string;
  projectId: string;
  contentType: ContentType;
  content: {
    script?: string;
    hook?: string;
    caption: string;
    hashtags: string[];
    callToAction?: string;
    mediaUrls: MediaItem[];
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
  platformVariants: PlatformVariant[];
  generation: {
    promptUsed: string;
    model: string;
    tokensUsed: number;
    costUSD: number;
    generatedAt: Date;
  };
  status: "generating" | "draft" | "ready" | "scheduled" | "published" | "failed";
  qualityScore?: QualityScore;
  createdAt: Date;
  updatedAt: Date;
}

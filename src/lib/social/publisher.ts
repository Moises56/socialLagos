import type { Platform } from "@/lib/utils/constants";
import type {
  ISocialPlatform,
  PlatformContent,
  PublishResult,
  PostMetrics,
  AccountMetrics,
} from "./platforms/base.platform";
import { FacebookPlatform } from "./platforms/facebook.platform";
import { TikTokPlatform } from "./platforms/tiktok.platform";
import { InstagramPlatform } from "./platforms/instagram.platform";
import { PlatformError } from "@/lib/utils/errors";

class SocialPublisher {
  private platforms: Map<Platform, ISocialPlatform>;

  constructor() {
    this.platforms = new Map();
    this.platforms.set("facebook", new FacebookPlatform());
    this.platforms.set("tiktok", new TikTokPlatform());
    this.platforms.set("instagram", new InstagramPlatform());
  }

  private getStrategy(platform: Platform): ISocialPlatform {
    const strategy = this.platforms.get(platform);
    if (!strategy) {
      throw new PlatformError(platform, `Plataforma "${platform}" no soportada`);
    }
    return strategy;
  }

  async getAuthUrl(platform: Platform, userId: string, redirectUri: string) {
    return this.getStrategy(platform).getAuthUrl(userId, redirectUri);
  }

  async handleCallback(platform: Platform, code: string, redirectUri: string) {
    return this.getStrategy(platform).handleCallback(code, redirectUri);
  }

  async refreshToken(platform: Platform, refreshToken: string) {
    return this.getStrategy(platform).refreshToken(refreshToken);
  }

  async getAccount(platform: Platform, accessToken: string) {
    return this.getStrategy(platform).getAccount(accessToken);
  }

  async publish(
    platform: Platform,
    accessToken: string,
    content: PlatformContent
  ): Promise<PublishResult> {
    return this.getStrategy(platform).publishContent(accessToken, content);
  }

  async getPostMetrics(
    platform: Platform,
    accessToken: string,
    postId: string
  ): Promise<PostMetrics> {
    return this.getStrategy(platform).getPostMetrics(accessToken, postId);
  }

  async getAccountMetrics(
    platform: Platform,
    accessToken: string,
    accountId: string
  ): Promise<AccountMetrics> {
    return this.getStrategy(platform).getAccountMetrics(accessToken, accountId);
  }
}

// Singleton
export const socialPublisher = new SocialPublisher();

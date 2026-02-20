import type {
  ISocialPlatform,
  OAuthUrl,
  TokenPair,
  PlatformAccount,
  PlatformContent,
  PublishResult,
  PostMetrics,
  AccountMetrics,
} from "./base.platform";
import { PlatformError } from "@/lib/utils/errors";
import crypto from "crypto";

const TIKTOK_AUTH_BASE = "https://www.tiktok.com/v2/auth/authorize";
const TIKTOK_API_BASE = "https://open.tiktokapis.com/v2";

export class TikTokPlatform implements ISocialPlatform {
  platform = "tiktok" as const;

  private get clientKey() {
    const key = process.env.TIKTOK_CLIENT_KEY;
    if (!key)
      throw new PlatformError("tiktok", "TIKTOK_CLIENT_KEY no configurado");
    return key;
  }

  private get clientSecret() {
    const secret = process.env.TIKTOK_CLIENT_SECRET;
    if (!secret)
      throw new PlatformError("tiktok", "TIKTOK_CLIENT_SECRET no configurado");
    return secret;
  }

  async getAuthUrl(userId: string, redirectUri: string): Promise<OAuthUrl> {
    const state = crypto.randomBytes(16).toString("hex") + ":" + userId;
    const codeVerifier = crypto.randomBytes(32).toString("base64url");
    const codeChallenge = crypto
      .createHash("sha256")
      .update(codeVerifier)
      .digest("base64url");

    const scopes = [
      "user.info.basic",
      "user.info.stats",
      "video.publish",
      "video.list",
    ].join(",");

    const url =
      `${TIKTOK_AUTH_BASE}?` +
      `client_key=${this.clientKey}` +
      `&response_type=code` +
      `&scope=${scopes}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${state}` +
      `&code_challenge=${codeChallenge}` +
      `&code_challenge_method=S256`;

    // Store codeVerifier in state for later (in real app, use a cache/session)
    return { url, state: `${state}|${codeVerifier}` };
  }

  async handleCallback(code: string, redirectUri: string): Promise<TokenPair> {
    const res = await fetch(`${TIKTOK_API_BASE}/oauth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: this.clientKey,
        client_secret: this.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    const data = await res.json();

    if (data.error || !data.access_token) {
      throw new PlatformError(
        "tiktok",
        data.error_description ?? "Error al obtener token",
        data
      );
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + (data.expires_in ?? 86400) * 1000),
      scopes: data.scope?.split(",") ?? [],
    };
  }

  async refreshToken(refreshTokenStr: string): Promise<TokenPair> {
    const res = await fetch(`${TIKTOK_API_BASE}/oauth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: this.clientKey,
        client_secret: this.clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshTokenStr,
      }),
    });

    const data = await res.json();

    if (data.error) {
      throw new PlatformError("tiktok", data.error_description ?? "Error al refrescar token");
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + (data.expires_in ?? 86400) * 1000),
      scopes: data.scope?.split(",") ?? [],
    };
  }

  async getAccount(accessToken: string): Promise<PlatformAccount> {
    const res = await fetch(`${TIKTOK_API_BASE}/user/info/`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await res.json();

    if (data.error?.code) {
      throw new PlatformError("tiktok", data.error.message);
    }

    const user = data.data?.user;
    return {
      platformAccountId: user?.open_id ?? user?.union_id ?? "",
      accountName: user?.display_name ?? "TikTok User",
      accountType: "profile",
      avatarUrl: user?.avatar_url,
    };
  }

  async publishContent(
    accessToken: string,
    content: PlatformContent
  ): Promise<PublishResult> {
    if (!content.mediaUrl || content.mediaType !== "video") {
      throw new PlatformError(
        "tiktok",
        "TikTok solo acepta publicación de videos. Proporciona un mediaUrl de tipo video."
      );
    }

    // Step 1: Init upload
    const initRes = await fetch(`${TIKTOK_API_BASE}/post/publish/video/init/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        post_info: {
          title: content.caption.substring(0, 150),
          privacy_level: "PUBLIC_TO_EVERYONE",
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
        },
        source_info: {
          source: "PULL_FROM_URL",
          video_url: content.mediaUrl,
        },
      }),
    });

    const initData = await initRes.json();

    if (initData.error?.code) {
      throw new PlatformError("tiktok", initData.error.message, initData.error);
    }

    const publishId = initData.data?.publish_id;

    return {
      platformPostId: publishId ?? "pending",
      platformPostUrl: "https://www.tiktok.com",
    };
  }

  async getPostMetrics(
    accessToken: string,
    postId: string
  ): Promise<PostMetrics> {
    const res = await fetch(`${TIKTOK_API_BASE}/video/query/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filters: { video_ids: [postId] },
      }),
    });

    const data = await res.json();
    const video = data.data?.videos?.[0];

    return {
      views: video?.view_count ?? 0,
      likes: video?.like_count ?? 0,
      comments: video?.comment_count ?? 0,
      shares: video?.share_count ?? 0,
      saves: 0,
      watchTimeSeconds: 0,
      avgWatchPercent: 0,
      reachUnique: video?.reach_count ?? 0,
      impressions: video?.view_count ?? 0,
      engagementRate: 0,
    };
  }

  async getAccountMetrics(
    accessToken: string,
    _accountId: string
  ): Promise<AccountMetrics> {
    const res = await fetch(
      `${TIKTOK_API_BASE}/user/info/?fields=follower_count,following_count,likes_count,video_count`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const data = await res.json();
    const user = data.data?.user;

    return {
      followers: user?.follower_count ?? 0,
      followersGrowth: 0,
      totalViews: 0,
      totalWatchMinutes: 0,
      avgEngagementRate: 0,
    };
  }
}

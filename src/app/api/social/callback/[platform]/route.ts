import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { completeOAuth } from "@/lib/social/oauth-manager";
import type { Platform } from "@/lib/utils/constants";

const VALID_PLATFORMS = ["facebook", "tiktok", "instagram"];
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(
        `${APP_URL}/login?error=not_authenticated`
      );
    }

    const { platform } = await params;

    if (!VALID_PLATFORMS.includes(platform)) {
      return NextResponse.redirect(
        `${APP_URL}/dashboard/accounts?error=invalid_platform`
      );
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorReason = searchParams.get("error_reason");
    const errorDesc = searchParams.get("error_description");

    console.log(`[OAuth Callback] platform=${platform}, hasCode=${!!code}, error=${error}, reason=${errorReason}, desc=${errorDesc}`);
    console.log(`[OAuth Callback] Full URL params:`, Object.fromEntries(searchParams.entries()));

    if (error) {
      const msg = errorDesc || errorReason || error;
      return NextResponse.redirect(
        `${APP_URL}/dashboard/accounts?error=${encodeURIComponent(msg)}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${APP_URL}/dashboard/accounts?error=no_code`
      );
    }

    await completeOAuth(
      platform as Platform,
      code,
      session.user.id
    );

    return NextResponse.redirect(
      `${APP_URL}/dashboard/accounts?connected=${platform}`
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error de conexión";
    return NextResponse.redirect(
      `${APP_URL}/dashboard/accounts?error=${encodeURIComponent(message)}`
    );
  }
}

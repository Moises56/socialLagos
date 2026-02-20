import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { initiateOAuth } from "@/lib/social/oauth-manager";
import { errorResponse, AppError } from "@/lib/utils/errors";
import type { Platform } from "@/lib/utils/constants";

const VALID_PLATFORMS = ["facebook", "tiktok", "instagram"];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponse(new AppError("No autenticado", "AUTH_ERROR", 401)),
        { status: 401 }
      );
    }

    const { platform } = await params;

    if (!VALID_PLATFORMS.includes(platform)) {
      return NextResponse.json(
        errorResponse(
          new AppError(`Plataforma "${platform}" no soportada`, "INVALID_PLATFORM", 400)
        ),
        { status: 400 }
      );
    }

    const { url } = await initiateOAuth(
      platform as Platform,
      session.user.id
    );

    return NextResponse.redirect(url);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(errorResponse(error), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(
      errorResponse(
        new AppError(
          error instanceof Error ? error.message : "Error al conectar",
          "OAUTH_ERROR",
          500
        )
      ),
      { status: 500 }
    );
  }
}

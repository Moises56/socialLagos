import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoose";
import SocialAccount from "@/lib/db/models/social-account.model";
import { calculateProjection } from "@/lib/social/monetization-projector";
import { successResponse, errorResponse, AppError } from "@/lib/utils/errors";
import type { Platform } from "@/lib/utils/constants";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponse(new AppError("No autenticado", "AUTH_ERROR", 401)),
        { status: 401 }
      );
    }

    await connectDB();

    const accounts = await SocialAccount.find({
      userId: session.user.id,
      isActive: true,
    })
      .select("-auth")
      .lean();

    const projections = accounts.map((account) => {
      const projection = calculateProjection({
        platform: account.platform as Platform,
        currentFollowers: account.monetization?.currentFollowers ?? 0,
        currentViews30d: account.monetization?.currentViews30d ?? 0,
        currentWatchMinutes60d: account.monetization?.currentWatchMinutes60d ?? 0,
        targetFollowers: account.monetization?.targetFollowers ?? 10000,
        targetViews: account.monetization?.targetViews ?? 100000,
        targetWatchMinutes: account.monetization?.targetWatchMinutes ?? 600000,
        recentSnapshots: (account.recentSnapshots ?? []).map((s) => ({
          date: s.date,
          followers: s.followers,
          views: s.views,
          watchMinutes: s.watchMinutes,
        })),
      });

      return {
        accountId: account._id.toString(),
        accountName: account.accountName,
        avatarUrl: account.avatarUrl,
        monetizationStatus: account.monetization?.status ?? "not_eligible",
        ...projection,
      };
    });

    return NextResponse.json(successResponse(projections));
  } catch (error) {
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error : new Error("Error desconocido")
      ),
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoose";
import GeneratedContent from "@/lib/db/models/generated-content.model";
import Publication from "@/lib/db/models/publication.model";
import SocialAccount from "@/lib/db/models/social-account.model";
import { successResponse, errorResponse, AppError } from "@/lib/utils/errors";

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
    const userId = session.user.id;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      contentThisMonth,
      postsPublished,
      scheduledCount,
      connectedAccounts,
      publications,
    ] = await Promise.all([
      GeneratedContent.countDocuments({
        userId,
        createdAt: { $gte: startOfMonth },
      }),
      Publication.countDocuments({
        userId,
        status: "published",
        publishedAt: { $gte: startOfMonth },
      }),
      Publication.countDocuments({
        userId,
        status: "scheduled",
      }),
      SocialAccount.countDocuments({
        userId,
        isActive: true,
      }),
      Publication.find({
        userId,
        status: "published",
        publishedAt: { $gte: thirtyDaysAgo },
      })
        .select("metrics")
        .lean(),
    ]);

    const totalViews = publications.reduce(
      (sum, p) => sum + (p.metrics?.views ?? 0),
      0
    );
    const totalEngagement = publications.reduce(
      (sum, p) =>
        sum +
        (p.metrics?.likes ?? 0) +
        (p.metrics?.comments ?? 0) +
        (p.metrics?.shares ?? 0),
      0
    );

    return NextResponse.json(
      successResponse({
        contentThisMonth,
        postsPublished,
        scheduledCount,
        connectedAccounts,
        totalViews,
        totalEngagement,
      })
    );
  } catch (error) {
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error : new Error("Error desconocido")
      ),
      { status: 500 }
    );
  }
}

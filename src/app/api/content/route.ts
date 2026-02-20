import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoose";
import GeneratedContent from "@/lib/db/models/generated-content.model";
import { successResponse, errorResponse, AppError } from "@/lib/utils/errors";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponse(new AppError("No autenticado", "AUTH_ERROR", 401)),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 50);
    const status = searchParams.get("status");
    const contentType = searchParams.get("contentType");

    await connectDB();

    const filter: Record<string, unknown> = { userId: session.user.id };
    if (status) filter.status = status;
    if (contentType) filter.contentType = contentType;

    const [contents, total] = await Promise.all([
      GeneratedContent.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      GeneratedContent.countDocuments(filter),
    ]);

    return NextResponse.json(
      successResponse({
        contents: contents.map((c) => ({
          id: c._id.toString(),
          contentType: c.contentType,
          caption: c.content.caption,
          hook: c.content.hook,
          hashtags: c.content.hashtags,
          status: c.status,
          qualityScore: c.qualityScore,
          platformVariants: c.platformVariants,
          createdAt: c.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
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

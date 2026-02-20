import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoose";
import GeneratedContent from "@/lib/db/models/generated-content.model";
import Publication from "@/lib/db/models/publication.model";
import SocialAccount from "@/lib/db/models/social-account.model";
import { successResponse, errorResponse, AppError } from "@/lib/utils/errors";

const scheduleSchema = z.object({
  contentId: z.string().min(1),
  socialAccountId: z.string().min(1),
  scheduledAt: z.string().refine(
    (d) => new Date(d).getTime() > Date.now() + 5 * 60 * 1000,
    "La fecha debe ser al menos 5 minutos en el futuro"
  ),
});

// POST - Schedule a publication
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponse(new AppError("No autenticado", "AUTH_ERROR", 401)),
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = scheduleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(
          new AppError(parsed.error.issues[0].message, "VALIDATION_ERROR", 400)
        ),
        { status: 400 }
      );
    }

    await connectDB();

    const content = await GeneratedContent.findOne({
      _id: parsed.data.contentId,
      userId: session.user.id,
    });
    if (!content) {
      return NextResponse.json(
        errorResponse(new AppError("Contenido no encontrado", "NOT_FOUND", 404)),
        { status: 404 }
      );
    }

    const account = await SocialAccount.findOne({
      _id: parsed.data.socialAccountId,
      userId: session.user.id,
      isActive: true,
    });
    if (!account) {
      return NextResponse.json(
        errorResponse(
          new AppError("Cuenta social no encontrada", "NOT_FOUND", 404)
        ),
        { status: 404 }
      );
    }

    const publication = await Publication.create({
      userId: session.user.id,
      contentId: content._id,
      socialAccountId: account._id,
      platform: account.platform,
      status: "scheduled",
      scheduledAt: new Date(parsed.data.scheduledAt),
    });

    await GeneratedContent.findByIdAndUpdate(content._id, {
      $set: { status: "scheduled" },
    });

    return NextResponse.json(
      successResponse({
        publicationId: publication._id.toString(),
        scheduledAt: publication.scheduledAt,
        platform: publication.platform,
        status: "scheduled",
      }),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(errorResponse(error), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(
      errorResponse(
        new AppError(
          error instanceof Error ? error.message : "Error al programar",
          "SCHEDULE_ERROR",
          500
        )
      ),
      { status: 500 }
    );
  }
}

// GET - List scheduled publications
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
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const status = searchParams.get("status");

    await connectDB();

    const filter: Record<string, unknown> = { userId: session.user.id };

    if (status) {
      filter.status = status;
    } else {
      filter.status = { $in: ["scheduled", "published", "failed"] };
    }

    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.$gte = new Date(from);
      if (to) dateFilter.$lte = new Date(to);
      filter.$or = [{ scheduledAt: dateFilter }, { publishedAt: dateFilter }];
    }

    const publications = await Publication.find(filter)
      .sort({ scheduledAt: 1, createdAt: -1 })
      .populate("contentId", "contentType content.caption content.hook qualityScore")
      .populate("socialAccountId", "platform accountName avatarUrl")
      .lean();

    const items = publications.map((p) => {
      const contentDoc = p.contentId as unknown as Record<string, unknown> | null;
      const accountDoc = p.socialAccountId as unknown as Record<string, unknown> | null;
      const contentObj = contentDoc?.content as Record<string, unknown> | undefined;

      return {
      id: p._id.toString(),
      contentId: contentDoc?._id?.toString(),
      content: contentDoc
        ? {
            type: contentDoc.contentType,
            caption: contentObj?.caption,
            hook: contentObj?.hook,
          }
        : null,
      account: accountDoc
        ? {
            id: accountDoc._id?.toString(),
            platform: accountDoc.platform,
            name: accountDoc.accountName,
            avatar: accountDoc.avatarUrl,
          }
        : null,
      platform: p.platform,
      status: p.status,
      scheduledAt: p.scheduledAt,
      publishedAt: p.publishedAt,
      platformPostUrl: p.platformPostUrl,
      errorMessage: p.errorMessage,
      createdAt: p.createdAt,
    };
    });

    return NextResponse.json(successResponse(items));
  } catch (error) {
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error : new Error("Error desconocido")
      ),
      { status: 500 }
    );
  }
}

// DELETE - Cancel a scheduled publication
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponse(new AppError("No autenticado", "AUTH_ERROR", 401)),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const publicationId = searchParams.get("id");

    if (!publicationId) {
      return NextResponse.json(
        errorResponse(new AppError("id es requerido", "VALIDATION_ERROR", 400)),
        { status: 400 }
      );
    }

    await connectDB();

    const publication = await Publication.findOne({
      _id: publicationId,
      userId: session.user.id,
      status: "scheduled",
    });

    if (!publication) {
      return NextResponse.json(
        errorResponse(
          new AppError("Publicación programada no encontrada", "NOT_FOUND", 404)
        ),
        { status: 404 }
      );
    }

    await Publication.findByIdAndDelete(publication._id);

    // Revert content status if no other scheduled publications exist
    const otherScheduled = await Publication.countDocuments({
      contentId: publication.contentId,
      status: "scheduled",
    });
    if (otherScheduled === 0) {
      await GeneratedContent.findByIdAndUpdate(publication.contentId, {
        $set: { status: "ready" },
      });
    }

    return NextResponse.json(successResponse({ cancelled: true }));
  } catch (error) {
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error : new Error("Error desconocido")
      ),
      { status: 500 }
    );
  }
}

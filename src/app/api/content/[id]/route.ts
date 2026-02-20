import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoose";
import GeneratedContent from "@/lib/db/models/generated-content.model";
import { successResponse, errorResponse, AppError } from "@/lib/utils/errors";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponse(new AppError("No autenticado", "AUTH_ERROR", 401)),
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();

    const content = await GeneratedContent.findOne({
      _id: id,
      userId: session.user.id,
    }).lean();

    if (!content) {
      return NextResponse.json(
        errorResponse(
          new AppError("Contenido no encontrado", "NOT_FOUND", 404)
        ),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse({
        id: content._id.toString(),
        contentType: content.contentType,
        content: content.content,
        platformVariants: content.platformVariants,
        generation: content.generation,
        status: content.status,
        qualityScore: content.qualityScore,
        createdAt: content.createdAt,
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponse(new AppError("No autenticado", "AUTH_ERROR", 401)),
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();

    const content = await GeneratedContent.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!content) {
      return NextResponse.json(
        errorResponse(
          new AppError("Contenido no encontrado", "NOT_FOUND", 404)
        ),
        { status: 404 }
      );
    }

    return NextResponse.json(successResponse({ deleted: true }));
  } catch (error) {
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error : new Error("Error desconocido")
      ),
      { status: 500 }
    );
  }
}

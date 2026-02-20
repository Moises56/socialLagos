import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoose";
import GeneratedContent from "@/lib/db/models/generated-content.model";
import { uploadMedia } from "@/lib/upload/cloudinary";
import { successResponse, errorResponse, AppError } from "@/lib/utils/errors";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(
  request: Request,
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

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        errorResponse(new AppError("No se envió ninguna imagen", "VALIDATION_ERROR", 400)),
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        errorResponse(
          new AppError(
            "Formato no soportado. Usa JPG, PNG, WebP o GIF.",
            "VALIDATION_ERROR",
            400
          )
        ),
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        errorResponse(
          new AppError("La imagen no debe superar 10MB", "VALIDATION_ERROR", 400)
        ),
        { status: 400 }
      );
    }

    await connectDB();

    const content = await GeneratedContent.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!content) {
      return NextResponse.json(
        errorResponse(new AppError("Contenido no encontrado", "NOT_FOUND", 404)),
        { status: 404 }
      );
    }

    // Convert File to Buffer and upload to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await uploadMedia(buffer, {
      folder: `socialforge/${session.user.id}/uploads`,
      resourceType: "image",
      userId: session.user.id,
    });

    const newMedia = {
      type: "image" as const,
      url: uploaded.url,
      width: uploaded.width,
      height: uploaded.height,
      sizeBytes: uploaded.sizeBytes,
    };

    // Update content in DB
    await GeneratedContent.findByIdAndUpdate(content._id, {
      $set: { "content.mediaUrls": [newMedia] },
    });

    return NextResponse.json(
      successResponse({
        mediaUrl: newMedia,
        message: "Imagen subida exitosamente",
      }),
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al subir imagen";
    return NextResponse.json(
      errorResponse(new AppError(message, "UPLOAD_ERROR", 500)),
      { status: 500 }
    );
  }
}

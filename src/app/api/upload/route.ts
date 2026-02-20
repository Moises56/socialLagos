import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { uploadMedia } from "@/lib/upload/cloudinary";
import { successResponse, errorResponse, AppError } from "@/lib/utils/errors";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponse(new AppError("No autenticado", "AUTH_ERROR", 401)),
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        errorResponse(new AppError("No se envió archivo", "VALIDATION_ERROR", 400)),
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        errorResponse(
          new AppError("El archivo excede 100MB", "FILE_TOO_LARGE", 400)
        ),
        { status: 400 }
      );
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        errorResponse(
          new AppError(
            "Tipo de archivo no soportado. Usa JPG, PNG, WebP, GIF, MP4, MOV o WebM",
            "INVALID_FILE_TYPE",
            400
          )
        ),
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadMedia(buffer, {
      userId: session.user.id,
      resourceType: isVideo ? "video" : "image",
    });

    return NextResponse.json(
      successResponse({
        ...result,
        originalName: file.name,
        mimeType: file.type,
      }),
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      errorResponse(
        new AppError(
          error instanceof Error ? error.message : "Error al subir archivo",
          "UPLOAD_ERROR",
          500
        )
      ),
      { status: 500 }
    );
  }
}

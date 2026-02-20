import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoose";
import GeneratedContent from "@/lib/db/models/generated-content.model";
import { generateImagePrompt, generateImage } from "@/lib/ai/image-generator";
import { uploadMedia } from "@/lib/upload/cloudinary";
import { successResponse, errorResponse, AppError } from "@/lib/utils/errors";

export async function POST(
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
    });

    if (!content) {
      return NextResponse.json(
        errorResponse(
          new AppError("Contenido no encontrado", "NOT_FOUND", 404)
        ),
        { status: 404 }
      );
    }

    // Determine aspect ratio from platform variants
    const aspectRatio =
      content.platformVariants[0]?.aspectRatio ?? "16:9";

    // Generate image prompt from content context
    const imagePrompt = await generateImagePrompt({
      niche: content.generation?.promptUsed?.split("|")[0]?.trim() ?? "general",
      topic: content.content.hook ?? content.content.caption.slice(0, 100),
      caption: content.content.caption,
      tone: content.generation?.promptUsed?.split("|")[1]?.trim() ?? "educational",
    });

    const niche = content.generation?.promptUsed?.split("|")[0]?.trim() ?? "general";

    // Generate image with all providers + local fallback
    const { buffer, width, height } = await generateImage(
      imagePrompt,
      aspectRatio,
      {
        hook: content.content.hook,
        niche,
        contentType: content.contentType,
      }
    );

    // Upload to Cloudinary
    const uploaded = await uploadMedia(buffer, {
      folder: `socialforge/${session.user.id}/generated`,
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
        message: "Imagen generada exitosamente",
      }),
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al generar imagen";
    return NextResponse.json(
      errorResponse(new AppError(message, "IMAGE_ERROR", 500)),
      { status: 500 }
    );
  }
}

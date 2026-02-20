import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoose";
import GeneratedContent from "@/lib/db/models/generated-content.model";
import Publication from "@/lib/db/models/publication.model";
import SocialAccount from "@/lib/db/models/social-account.model";
import { socialPublisher } from "@/lib/social/publisher";
import { decrypt } from "@/lib/utils/encryption";
import { uploadMedia } from "@/lib/upload/cloudinary";
import { createVideoFromImageAndAudio } from "@/lib/media/video-creator";
import { successResponse, errorResponse, AppError } from "@/lib/utils/errors";
import type { Platform } from "@/lib/utils/constants";

const publishSchema = z.object({
  contentId: z.string().min(1),
  socialAccountId: z.string().min(1),
});

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
    const parsed = publishSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(
          new AppError(parsed.error.issues[0].message, "VALIDATION_ERROR", 400)
        ),
        { status: 400 }
      );
    }

    await connectDB();

    // Verify content belongs to user
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

    // Verify social account belongs to user
    const account = await SocialAccount.findOne({
      _id: parsed.data.socialAccountId,
      userId: session.user.id,
      isActive: true,
    });
    if (!account) {
      return NextResponse.json(
        errorResponse(
          new AppError("Cuenta social no encontrada o desconectada", "NOT_FOUND", 404)
        ),
        { status: 404 }
      );
    }

    // Find the platform variant for this account's platform
    const variant = content.platformVariants.find(
      (v) => v.platform === account.platform
    );
    const caption = variant?.caption ?? content.content.caption;
    const hashtags = variant?.hashtags ?? content.content.hashtags;

    // Decrypt token
    const accessToken = decrypt(account.auth.accessToken);

    // Create publication record
    const publication = await Publication.create({
      userId: session.user.id,
      contentId: content._id,
      socialAccountId: account._id,
      platform: account.platform,
      status: "publishing",
    });

    try {
      // Determine media to publish
      let mediaUrl = content.content.mediaUrls[0]?.url;
      let mediaType = content.content.mediaUrls[0]?.type as
        | "image"
        | "video"
        | undefined;

      // If we have an image + voiceover, combine into video for Reel
      const voiceover = content.content.voiceover;
      if (
        mediaUrl &&
        mediaType === "image" &&
        voiceover?.url &&
        voiceover.durationSeconds > 0
      ) {
        try {
          const videoBuffer = await createVideoFromImageAndAudio(
            mediaUrl,
            voiceover.url,
            voiceover.durationSeconds
          );

          // Upload video to Cloudinary
          const uploaded = await uploadMedia(videoBuffer, {
            folder: `socialforge/${session.user.id}/reels`,
            resourceType: "video",
            userId: session.user.id,
          });

          mediaUrl = uploaded.url;
          mediaType = "video";
        } catch (videoErr) {
          // If video creation fails, fall back to publishing as image
          console.warn(
            "[publish] Video creation failed, publishing as image:",
            videoErr instanceof Error ? videoErr.message : videoErr
          );
        }
      }

      // Publish to platform
      const result = await socialPublisher.publish(
        account.platform as Platform,
        accessToken,
        {
          caption,
          hashtags,
          mediaUrl,
          mediaType,
          accountId: account.platformAccountId,
        }
      );

      // Update publication
      await Publication.findByIdAndUpdate(publication._id, {
        $set: {
          status: "published",
          publishedAt: new Date(),
          platformPostId: result.platformPostId,
          platformPostUrl: result.platformPostUrl,
        },
      });

      // Update content status
      await GeneratedContent.findByIdAndUpdate(content._id, {
        $set: { status: "published" },
      });

      return NextResponse.json(
        successResponse({
          publicationId: publication._id.toString(),
          platformPostId: result.platformPostId,
          platformPostUrl: result.platformPostUrl,
          status: "published",
        }),
        { status: 201 }
      );
    } catch (publishError) {
      // Mark publication as failed
      await Publication.findByIdAndUpdate(publication._id, {
        $set: {
          status: "failed",
          errorMessage:
            publishError instanceof Error
              ? publishError.message
              : "Error de publicación",
          $inc: { retryCount: 1 },
        },
      });

      throw publishError;
    }
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(errorResponse(error), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(
      errorResponse(
        new AppError(
          error instanceof Error ? error.message : "Error al publicar",
          "PUBLISH_ERROR",
          500
        )
      ),
      { status: 500 }
    );
  }
}

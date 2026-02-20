import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Publication from "@/lib/db/models/publication.model";
import GeneratedContent from "@/lib/db/models/generated-content.model";
import SocialAccount from "@/lib/db/models/social-account.model";
import { socialPublisher } from "@/lib/social/publisher";
import { decrypt } from "@/lib/utils/encryption";
import type { Platform } from "@/lib/utils/constants";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  // Verify cron secret (Vercel Cron or manual trigger)
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    // Find publications that are due
    const now = new Date();
    const duePublications = await Publication.find({
      status: "scheduled",
      scheduledAt: { $lte: now },
    }).limit(10);

    const results: Array<{ id: string; status: string; error?: string }> = [];

    for (const pub of duePublications) {
      try {
        // Mark as publishing
        await Publication.findByIdAndUpdate(pub._id, {
          $set: { status: "publishing" },
        });

        const account = await SocialAccount.findById(pub.socialAccountId);
        if (!account || !account.isActive) {
          await Publication.findByIdAndUpdate(pub._id, {
            $set: { status: "failed", errorMessage: "Cuenta desconectada" },
          });
          results.push({
            id: pub._id.toString(),
            status: "failed",
            error: "Account disconnected",
          });
          continue;
        }

        const content = await GeneratedContent.findById(pub.contentId);
        if (!content) {
          await Publication.findByIdAndUpdate(pub._id, {
            $set: { status: "failed", errorMessage: "Contenido no encontrado" },
          });
          results.push({
            id: pub._id.toString(),
            status: "failed",
            error: "Content not found",
          });
          continue;
        }

        const variant = content.platformVariants.find(
          (v) => v.platform === pub.platform
        );
        const caption = variant?.caption ?? content.content.caption;
        const hashtags = variant?.hashtags ?? content.content.hashtags;
        const accessToken = decrypt(account.auth.accessToken);

        const result = await socialPublisher.publish(
          pub.platform as Platform,
          accessToken,
          {
            caption,
            hashtags,
            mediaUrl: content.content.mediaUrls[0]?.url,
            mediaType: content.content.mediaUrls[0]?.type as
              | "image"
              | "video"
              | undefined,
          }
        );

        await Publication.findByIdAndUpdate(pub._id, {
          $set: {
            status: "published",
            publishedAt: new Date(),
            platformPostId: result.platformPostId,
            platformPostUrl: result.platformPostUrl,
          },
        });

        await GeneratedContent.findByIdAndUpdate(content._id, {
          $set: { status: "published" },
        });

        results.push({ id: pub._id.toString(), status: "published" });
      } catch (err) {
        await Publication.findByIdAndUpdate(pub._id, {
          $set: {
            status: "failed",
            errorMessage:
              err instanceof Error ? err.message : "Error de publicación",
          },
          $inc: { retryCount: 1 },
        });
        results.push({
          id: pub._id.toString(),
          status: "failed",
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      processed: results.length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cron error" },
      { status: 500 }
    );
  }
}

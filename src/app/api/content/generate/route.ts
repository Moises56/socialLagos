import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoose";
import GeneratedContent from "@/lib/db/models/generated-content.model";
import ContentProject from "@/lib/db/models/content-project.model";
import User from "@/lib/db/models/user.model";
import { generateContent } from "@/lib/ai/content-generator";
import { scoreContent } from "@/lib/ai/quality-scorer";
import { generateImagePrompt, generateImage } from "@/lib/ai/image-generator";
import { generateVoiceover } from "@/lib/ai/voice-generator";
import { uploadMedia } from "@/lib/upload/cloudinary";
import { successResponse, errorResponse, AppError } from "@/lib/utils/errors";
import { PLANS } from "@/lib/utils/constants";
import type { PlanKey } from "@/lib/utils/constants";

const generateSchema = z.object({
  projectId: z.string().optional(),
  niche: z.string().min(1, "El nicho es requerido"),
  tone: z.enum([
    "educational",
    "entertainment",
    "inspirational",
    "controversial",
    "storytelling",
  ]),
  targetAudience: z.string().min(1, "La audiencia es requerida"),
  language: z.string().default("es"),
  contentPillars: z.array(z.string()).min(1, "Al menos un pilar de contenido"),
  contentType: z.enum(["reel", "video", "image", "carousel", "story"]),
  platforms: z
    .array(z.enum(["facebook", "tiktok", "instagram"]))
    .min(1, "Al menos una plataforma"),
  topic: z.string().optional(),
  brandVoice: z.string().optional(),
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
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(
          new AppError(parsed.error.issues[0].message, "VALIDATION_ERROR", 400)
        ),
        { status: 400 }
      );
    }

    await connectDB();

    // Check usage limits
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        errorResponse(new AppError("Usuario no encontrado", "NOT_FOUND", 404)),
        { status: 404 }
      );
    }

    const planLimits = PLANS[user.plan as PlanKey];
    if (user.usage.contentGenerated >= planLimits.contentPerMonth) {
      return NextResponse.json(
        errorResponse(
          new AppError(
            `Límite de contenido alcanzado (${planLimits.contentPerMonth}/mes). Actualiza tu plan para generar más.`,
            "LIMIT_REACHED",
            429
          )
        ),
        { status: 429 }
      );
    }

    const params = parsed.data;

    // Get or create a default project
    let projectId = params.projectId;
    if (!projectId) {
      let defaultProject = await ContentProject.findOne({
        userId: user._id,
        name: "Contenido rápido",
        status: "active",
      });

      if (!defaultProject) {
        defaultProject = await ContentProject.create({
          userId: user._id,
          name: "Contenido rápido",
          niche: params.niche,
          config: {
            tone: params.tone,
            targetAudience: params.targetAudience,
            language: params.language,
            contentPillars: params.contentPillars,
          },
          socialAccountIds: [],
          status: "active",
        });
      }
      projectId = defaultProject._id.toString();
    }

    // Generate content with AI
    const result = await generateContent({
      niche: params.niche,
      tone: params.tone,
      targetAudience: params.targetAudience,
      language: params.language,
      contentPillars: params.contentPillars,
      contentType: params.contentType,
      platforms: params.platforms,
      topic: params.topic,
      brandVoice: params.brandVoice,
    });

    // Score quality
    const quality = await scoreContent({
      hook: result.hook,
      caption: result.caption,
      hashtags: result.hashtags,
      platform: params.platforms[0],
      niche: params.niche,
    });

    // Generate image
    const mediaUrls: Array<{
      type: "image" | "video" | "audio";
      url: string;
      width?: number;
      height?: number;
      sizeBytes: number;
    }> = [];
    let imageWarning: string | null = null;

    try {
      const primaryAspectRatio =
        result.platformVariants[0]?.aspectRatio ?? "16:9";

      const imagePrompt = await generateImagePrompt({
        niche: params.niche,
        topic: params.topic,
        caption: result.caption,
        tone: params.tone,
      });

      const { buffer, width, height } = await generateImage(
        imagePrompt,
        primaryAspectRatio,
        {
          hook: result.hook,
          niche: params.niche,
          contentType: params.contentType,
        }
      );

      const uploaded = await uploadMedia(buffer, {
        folder: `socialforge/${session.user.id}/generated`,
        resourceType: "image",
        userId: session.user.id,
      });

      mediaUrls.push({
        type: "image",
        url: uploaded.url,
        width: uploaded.width,
        height: uploaded.height,
        sizeBytes: uploaded.sizeBytes,
      });
    } catch (imageError) {
      const msg =
        imageError instanceof Error ? imageError.message : String(imageError);
      console.warn("Image generation failed, continuing without image:", msg);
      imageWarning = `No se pudo generar la imagen: ${msg}. Puedes reintentar desde el contenido.`;
    }

    // Generate voiceover from script/hook (free via Edge-TTS)
    let voiceoverData: {
      url: string;
      text: string;
      voice: string;
      durationSeconds: number;
    } | undefined;
    let subtitlesData: { url: string; language: string } | undefined;

    const voiceText = result.script || result.hook || result.caption;
    if (voiceText) {
      try {
        const voiceover = await generateVoiceover(voiceText);

        // Upload audio to Cloudinary
        const uploadedAudio = await uploadMedia(voiceover.audioBuffer, {
          folder: `socialforge/${session.user.id}/voiceover`,
          resourceType: "auto",
          userId: session.user.id,
        });

        voiceoverData = {
          url: uploadedAudio.url,
          text: voiceover.text,
          voice: voiceover.voice,
          durationSeconds: voiceover.durationSeconds,
        };

        // Upload subtitles (SRT as raw file)
        if (voiceover.subtitlesSrt) {
          const srtBuffer = Buffer.from(voiceover.subtitlesSrt, "utf8");
          const uploadedSrt = await uploadMedia(srtBuffer, {
            folder: `socialforge/${session.user.id}/subtitles`,
            resourceType: "auto",
            userId: session.user.id,
          });
          subtitlesData = {
            url: uploadedSrt.url,
            language: params.language,
          };
        }
      } catch (voiceError) {
        const msg =
          voiceError instanceof Error ? voiceError.message : String(voiceError);
        console.warn("[voiceover] Failed, continuing without voice:", msg);
      }
    }

    // Save to database
    const content = await GeneratedContent.create({
      userId: user._id,
      projectId,
      contentType: params.contentType,
      content: {
        script: result.script,
        hook: result.hook,
        caption: result.caption,
        hashtags: result.hashtags,
        callToAction: result.callToAction,
        mediaUrls,
        voiceover: voiceoverData,
        subtitles: subtitlesData,
      },
      platformVariants: result.platformVariants,
      generation: {
        promptUsed: `${params.niche} | ${params.tone} | ${params.contentType}`,
        model: result.generation.model,
        tokensUsed: result.generation.tokensUsed,
        costUSD: result.generation.costUSD,
        generatedAt: new Date(),
      },
      status: "ready",
      qualityScore: {
        overall: quality.overall,
        hookStrength: quality.hookStrength,
        captionQuality: quality.captionQuality,
        hashtagRelevance: quality.hashtagRelevance,
        estimatedReach: quality.estimatedReach,
      },
    });

    // Update usage
    await User.findByIdAndUpdate(user._id, {
      $inc: { "usage.contentGenerated": 1 },
    });

    return NextResponse.json(
      successResponse({
        content: {
          id: content._id.toString(),
          contentType: content.contentType,
          script: result.script,
          hook: result.hook,
          caption: result.caption,
          hashtags: result.hashtags,
          callToAction: result.callToAction,
          platformVariants: result.platformVariants,
          qualityScore: {
            overall: quality.overall,
            hookStrength: quality.hookStrength,
            captionQuality: quality.captionQuality,
            hashtagRelevance: quality.hashtagRelevance,
            estimatedReach: quality.estimatedReach,
            suggestions: quality.suggestions,
          },
          generation: {
            provider: result.generation.provider,
            model: result.generation.model,
          },
          mediaUrls,
          voiceover: voiceoverData ?? null,
          subtitles: subtitlesData ?? null,
          imageWarning,
        },
      }),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(errorResponse(error), {
        status: error.statusCode,
      });
    }
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      errorResponse(new AppError(message, "GENERATION_ERROR", 500)),
      { status: 500 }
    );
  }
}

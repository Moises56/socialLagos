import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoose";
import GeneratedContent from "@/lib/db/models/generated-content.model";
import { generateVoiceover, VOICES, type VoiceId } from "@/lib/ai/voice-generator";
import { uploadMedia } from "@/lib/upload/cloudinary";
import { successResponse, errorResponse, AppError } from "@/lib/utils/errors";

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
    const body = await request.json().catch(() => ({}));
    const voice = body.voice as string | undefined;

    if (voice && !(voice in VOICES)) {
      return NextResponse.json(
        errorResponse(new AppError("Voz no válida", "VALIDATION_ERROR", 400)),
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
        errorResponse(
          new AppError("Contenido no encontrado", "NOT_FOUND", 404)
        ),
        { status: 404 }
      );
    }

    // Use script, hook, or caption as voiceover text
    const voiceText =
      content.content.script || content.content.hook || content.content.caption;

    if (!voiceText) {
      return NextResponse.json(
        errorResponse(new AppError("No hay texto para voz", "VALIDATION_ERROR", 400)),
        { status: 400 }
      );
    }

    const voiceover = await generateVoiceover(
      voiceText,
      (voice as VoiceId) ?? undefined
    );

    // Upload audio to Cloudinary
    const uploadedAudio = await uploadMedia(voiceover.audioBuffer, {
      folder: `socialforge/${session.user.id}/voiceover`,
      resourceType: "auto",
      userId: session.user.id,
    });

    const voiceoverData = {
      url: uploadedAudio.url,
      text: voiceover.text,
      voice: voiceover.voice,
      durationSeconds: voiceover.durationSeconds,
    };

    // Upload subtitles
    let subtitlesData: { url: string; language: string } | undefined;
    if (voiceover.subtitlesSrt) {
      const srtBuffer = Buffer.from(voiceover.subtitlesSrt, "utf8");
      const uploadedSrt = await uploadMedia(srtBuffer, {
        folder: `socialforge/${session.user.id}/subtitles`,
        resourceType: "auto",
        userId: session.user.id,
      });
      subtitlesData = { url: uploadedSrt.url, language: "es" };
    }

    // Update DB
    await GeneratedContent.findByIdAndUpdate(content._id, {
      $set: {
        "content.voiceover": voiceoverData,
        ...(subtitlesData ? { "content.subtitles": subtitlesData } : {}),
      },
    });

    return NextResponse.json(
      successResponse({
        voiceover: voiceoverData,
        subtitles: subtitlesData ?? null,
      })
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al generar voz";
    return NextResponse.json(
      errorResponse(new AppError(message, "VOICE_ERROR", 500)),
      { status: 500 }
    );
  }
}

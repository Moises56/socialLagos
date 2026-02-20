import { EdgeTTS } from "node-edge-tts";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

// Spanish voices (most natural for social media content)
export const VOICES = {
  // Female
  "es-MX-DaliaNeural": "Dalia (MX, femenina)",
  "es-CO-SalomeNeural": "Salome (CO, femenina)",
  "es-ES-ElviraNeural": "Elvira (ES, femenina)",
  "es-AR-ElenaNeural": "Elena (AR, femenina)",
  // Male
  "es-MX-JorgeNeural": "Jorge (MX, masculino)",
  "es-CO-GonzaloNeural": "Gonzalo (CO, masculino)",
  "es-ES-AlvaroNeural": "Alvaro (ES, masculino)",
  "es-AR-TomasNeural": "Tomas (AR, masculino)",
  // English
  "en-US-EmmaMultilingualNeural": "Emma (US, multilingual)",
  "en-US-GuyNeural": "Guy (US, male)",
} as const;

export type VoiceId = keyof typeof VOICES;

const DEFAULT_VOICE: VoiceId = "es-MX-DaliaNeural";

interface WordBoundary {
  part: string;
  start: number; // ms
  end: number;   // ms
}

export interface VoiceoverResult {
  audioBuffer: Buffer;
  durationSeconds: number;
  subtitlesSrt: string;
  subtitlesVtt: string;
  voice: string;
  text: string;
}

/**
 * Strip script timestamp markers like [0:00-0:03], [0:15-0:30], etc.
 * so they are not read aloud by TTS.
 */
function stripTimestamps(text: string): string {
  return text
    .replace(/\[\d{1,2}:\d{2}[-–]\d{1,2}:\d{2}\]\s*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Generate voiceover audio + subtitles using Microsoft Edge TTS (100% free).
 * Uses node-edge-tts which outputs to file, then reads buffer.
 * Returns audio buffer ready for Cloudinary upload and SRT/VTT subtitle strings.
 */
export async function generateVoiceover(
  text: string,
  voice: VoiceId = DEFAULT_VOICE,
): Promise<VoiceoverResult> {
  const cleanText = stripTimestamps(text);
  const tts = new EdgeTTS({ saveSubtitles: true, voice });
  const audioPath = join(tmpdir(), `sf_voice_${Date.now()}.mp3`);
  const subsPath = `${audioPath}.json`;

  try {
    await tts.ttsPromise(cleanText, audioPath);

    // Read audio buffer
    const audioBuffer = await readFile(audioPath);
    if (audioBuffer.length < 100) {
      throw new Error("Edge-TTS returned empty audio");
    }

    // Read word boundaries for subtitles
    let subtitlesSrt = "";
    let subtitlesVtt = "WEBVTT\n\n";
    let durationSeconds = 0;

    try {
      const subsRaw = await readFile(subsPath, "utf8");
      const boundaries: WordBoundary[] = JSON.parse(subsRaw);

      if (boundaries.length > 0) {
        // Group words into subtitle lines (~6 words per line)
        const WORDS_PER_LINE = 6;
        let index = 1;

        for (let i = 0; i < boundaries.length; i += WORDS_PER_LINE) {
          const group = boundaries.slice(i, i + WORDS_PER_LINE);
          const first = group[0];
          const last = group[group.length - 1];

          const startMs = first.start;
          const endMs = last.end;
          const lineText = group.map((b) => b.part.trim()).join(" ");

          // SRT format
          subtitlesSrt += `${index}\n`;
          subtitlesSrt += `${formatSrtTime(startMs)} --> ${formatSrtTime(endMs)}\n`;
          subtitlesSrt += `${lineText}\n\n`;

          // VTT format
          subtitlesVtt += `${index}\n`;
          subtitlesVtt += `${formatVttTime(startMs)} --> ${formatVttTime(endMs)}\n`;
          subtitlesVtt += `${lineText}\n\n`;

          index++;
          durationSeconds = endMs / 1000;
        }
      }
    } catch {
      // Subtitle file not found, estimate duration from audio size
      durationSeconds = audioBuffer.length / 2000;
    }

    return {
      audioBuffer,
      durationSeconds: Math.round(durationSeconds * 10) / 10,
      subtitlesSrt,
      subtitlesVtt,
      voice,
      text: cleanText,
    };
  } finally {
    // Cleanup temp files
    await unlink(audioPath).catch(() => {});
    await unlink(subsPath).catch(() => {});
  }
}

function formatSrtTime(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = Math.floor(ms % 1000);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(millis, 3)}`;
}

function formatVttTime(ms: number): string {
  return formatSrtTime(ms).replace(",", ".");
}

function pad(n: number, len = 2): string {
  return n.toString().padStart(len, "0");
}

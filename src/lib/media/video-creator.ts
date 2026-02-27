import ffmpeg from "fluent-ffmpeg";
import { writeFile, readFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

// Set ffmpeg path: prefer @ffmpeg-installer package, fallback to system ffmpeg (Docker/Linux)
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const installer = require("@ffmpeg-installer/ffmpeg");
  if (installer?.path && existsSync(installer.path)) {
    ffmpeg.setFfmpegPath(installer.path);
  }
} catch {
  // System ffmpeg from PATH will be used (installed via apt in Docker)
}

/**
 * Combine a static image with an audio file to create an MP4 video.
 * The video duration matches the audio duration.
 * Returns a Buffer of the resulting MP4 file.
 */
export async function createVideoFromImageAndAudio(
  imageUrl: string,
  audioUrl: string,
  durationSeconds: number
): Promise<Buffer> {
  const tempDir = join(tmpdir(), "sf_video_" + Date.now());
  await mkdir(tempDir, { recursive: true });

  const imagePath = join(tempDir, "image.png");
  const audioPath = join(tempDir, "audio.mp3");
  const outputPath = join(tempDir, "output.mp4");

  try {
    // Download image and audio in parallel
    const [imageRes, audioRes] = await Promise.all([
      fetch(imageUrl, { signal: AbortSignal.timeout(30_000) }),
      fetch(audioUrl, { signal: AbortSignal.timeout(30_000) }),
    ]);

    if (!imageRes.ok) throw new Error(`Failed to download image: ${imageRes.status}`);
    if (!audioRes.ok) throw new Error(`Failed to download audio: ${audioRes.status}`);

    const [imageBuffer, audioBuffer] = await Promise.all([
      imageRes.arrayBuffer(),
      audioRes.arrayBuffer(),
    ]);

    await Promise.all([
      writeFile(imagePath, Buffer.from(imageBuffer)),
      writeFile(audioPath, Buffer.from(audioBuffer)),
    ]);

    // Create video using ffmpeg
    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(imagePath)
        .inputOptions(["-loop", "1"])
        .input(audioPath)
        .outputOptions([
          "-c:v",
          "libx264",
          "-tune",
          "stillimage",
          "-c:a",
          "aac",
          "-b:a",
          "192k",
          "-pix_fmt",
          "yuv420p",
          "-shortest",
          "-t",
          String(Math.ceil(durationSeconds)),
          "-movflags",
          "+faststart",
          "-vf",
          "scale=trunc(iw/2)*2:trunc(ih/2)*2",
        ])
        .output(outputPath)
        .on("end", () => resolve())
        .on("error", (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
        .run();
    });

    // Read the output video
    const videoBuffer = await readFile(outputPath);
    if (videoBuffer.length < 1000) {
      throw new Error("Generated video too small");
    }

    return videoBuffer;
  } finally {
    // Cleanup temp files
    await unlink(imagePath).catch(() => {});
    await unlink(audioPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
    // Try to remove the temp directory
    const { rmdir } = await import("fs/promises");
    await rmdir(tempDir).catch(() => {});
  }
}

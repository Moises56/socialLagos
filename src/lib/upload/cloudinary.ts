import { v2 as cloudinary } from "cloudinary";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  configured = true;
}

export interface UploadResult {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
  width: number;
  height: number;
  sizeBytes: number;
  format: string;
  durationSeconds?: number;
  thumbnailUrl?: string;
}

export async function uploadMedia(
  buffer: Buffer,
  options: {
    folder?: string;
    resourceType?: "image" | "video" | "auto";
    userId: string;
  }
): Promise<UploadResult> {
  ensureConfigured();

  const folder = options.folder ?? `socialforge/${options.userId}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: options.resourceType ?? "auto",
        transformation:
          options.resourceType === "video"
            ? undefined
            : [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Upload failed"));
          return;
        }

        const isVideo = result.resource_type === "video";

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: isVideo ? "video" : "image",
          width: result.width,
          height: result.height,
          sizeBytes: result.bytes,
          format: result.format,
          durationSeconds: isVideo ? result.duration : undefined,
          thumbnailUrl: isVideo
            ? result.secure_url.replace(/\.[^.]+$/, ".jpg")
            : undefined,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

export async function deleteMedia(publicId: string, resourceType: "image" | "video" = "image") {
  ensureConfigured();
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

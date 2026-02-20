"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  X,
  Image as ImageIcon,
  Video,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export interface UploadedMedia {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
  width: number;
  height: number;
  sizeBytes: number;
  format: string;
  durationSeconds?: number;
  thumbnailUrl?: string;
  originalName: string;
  mimeType: string;
}

interface MediaUploaderProps {
  onUpload: (media: UploadedMedia) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export function MediaUploader({
  onUpload,
  accept = "image/*,video/*",
  maxSizeMB = 100,
  className = "",
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    url: string;
    type: "image" | "video";
    name: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploaded, setUploaded] = useState<UploadedMedia | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setUploaded(null);

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`El archivo excede ${maxSizeMB}MB`);
        return;
      }

      const isVideo = file.type.startsWith("video/");
      const previewUrl = URL.createObjectURL(file);
      setPreview({
        url: previewUrl,
        type: isVideo ? "video" : "image",
        name: file.name,
      });

      try {
        setUploading(true);
        setProgress(10);

        const formData = new FormData();
        formData.append("file", file);

        // Simulate progress since fetch doesn't support progress natively
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90));
        }, 500);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);
        setProgress(100);

        const json = await res.json();

        if (!json.success) {
          setError(json.error?.message ?? "Error al subir");
          setPreview(null);
          URL.revokeObjectURL(previewUrl);
          return;
        }

        setUploaded(json.data);
        onUpload(json.data);
      } catch {
        setError("Error de conexión al subir archivo");
        setPreview(null);
        URL.revokeObjectURL(previewUrl);
      } finally {
        setUploading(false);
      }
    },
    [maxSizeMB, onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clear = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
    setUploaded(null);
    setError(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {!preview ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/50 p-8 transition-colors hover:border-indigo-500/50 hover:bg-indigo-500/5"
        >
          <Upload className="mb-3 h-8 w-8 text-slate-500" />
          <p className="mb-1 text-sm font-medium text-slate-300">
            Arrastra un archivo o haz clic para seleccionar
          </p>
          <p className="text-xs text-slate-500">
            JPG, PNG, WebP, GIF, MP4, MOV, WebM (máx. {maxSizeMB}MB)
          </p>
        </div>
      ) : (
        <div className="relative rounded-xl border border-slate-700 bg-slate-950/50 p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            className="absolute right-2 top-2 z-10 h-7 w-7 rounded-full bg-slate-900/80 p-0 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="mb-3 flex items-center gap-3">
            {preview.type === "image" ? (
              <img
                src={preview.url}
                alt="Preview"
                className="h-20 w-20 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-slate-800">
                <Video className="h-8 w-8 text-slate-400" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {preview.name}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                {preview.type === "image" ? (
                  <ImageIcon className="h-3 w-3 text-indigo-400" />
                ) : (
                  <Video className="h-3 w-3 text-cyan-400" />
                )}
                <span className="text-xs capitalize text-slate-500">
                  {preview.type}
                </span>
              </div>

              {uploading && (
                <div className="mt-2">
                  <Progress value={progress} className="h-1.5" />
                  <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Subiendo... {progress}%
                  </p>
                </div>
              )}

              {uploaded && (
                <p className="mt-2 flex items-center gap-1 text-xs text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Subido exitosamente
                  {uploaded.width && uploaded.height && (
                    <span className="text-slate-500">
                      ({uploaded.width}x{uploaded.height})
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-red-400">
              <AlertTriangle className="h-3 w-3" />
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

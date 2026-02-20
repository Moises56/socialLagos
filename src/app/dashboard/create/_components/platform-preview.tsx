"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Check,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ImagePlus,
  RefreshCw,
  Upload,
  Volume2,
} from "lucide-react";
import { useState } from "react";
import type { Platform } from "@/lib/utils/constants";
import type { SocialAccountData } from "@/hooks/use-social-accounts";
import type { PublishState } from "@/hooks/use-publish";

interface PlatformVariant {
  platform: Platform;
  caption: string;
  hashtags: string[];
  aspectRatio: string;
}

interface MediaUrl {
  type: string;
  url: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
}

interface VoiceoverData {
  url: string;
  voice: string;
  durationSeconds: number;
}

interface PlatformPreviewProps {
  variants: PlatformVariant[];
  hook: string;
  script?: string;
  callToAction: string;
  mediaUrls?: MediaUrl[];
  /* Publish props */
  contentId?: string;
  accounts?: SocialAccountData[];
  publishStates?: PublishState;
  onPublish?: (socialAccountId: string) => void;
  voiceover?: VoiceoverData | null;
  onRegenerateImage?: (contentId: string) => Promise<void>;
  onUploadImage?: (contentId: string, file: File) => Promise<void>;
  onRegenerateVoice?: (contentId: string, voice: string) => Promise<VoiceoverData>;
}

const platformConfig: Record<Platform, { label: string; color: string }> = {
  facebook: { label: "Facebook", color: "text-blue-400" },
  tiktok: { label: "TikTok", color: "text-white" },
  instagram: { label: "Instagram", color: "text-pink-400" },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-green-400" /> Copiado
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" /> Copiar
        </>
      )}
    </button>
  );
}

function PublishSection({
  platform,
  accounts,
  publishStates,
  onPublish,
}: {
  platform: Platform;
  accounts: SocialAccountData[];
  publishStates: PublishState;
  onPublish: (socialAccountId: string) => void;
}) {
  const platformAccounts = accounts.filter(
    (a) => a.platform === platform && a.isActive
  );

  if (platformAccounts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-700 p-3">
        <p className="text-center text-xs text-slate-500">
          No hay cuentas de {platformConfig[platform].label} conectadas.{" "}
          <a
            href="/dashboard/accounts"
            className="text-indigo-400 hover:text-indigo-300 underline"
          >
            Conectar cuenta
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-emerald-400">
        Publicar en {platformConfig[platform].label}
      </span>
      {platformAccounts.map((account) => {
        const state = publishStates[account.id];
        const isPublishing = state?.status === "publishing";
        const isPublished = state?.status === "published";
        const hasError = state?.status === "error";

        return (
          <div
            key={account.id}
            className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3"
          >
            <div className="flex items-center gap-2">
              {account.avatarUrl ? (
                <img
                  src={account.avatarUrl}
                  alt={account.accountName}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
                  {account.accountName[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-white">
                  {account.accountName}
                </p>
                <p className="text-xs text-slate-500 capitalize">
                  {account.accountType}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isPublished && (
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400">Publicado</span>
                  {state.platformPostUrl && (
                    <a
                      href={state.platformPostUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}

              {hasError && (
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="max-w-[150px] truncate text-xs text-red-400">
                    {state.error}
                  </span>
                </div>
              )}

              {!isPublished && (
                <Button
                  size="sm"
                  onClick={() => onPublish(account.id)}
                  disabled={isPublishing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Publicando...
                    </>
                  ) : hasError ? (
                    <>
                      <Send className="mr-1 h-3 w-3" />
                      Reintentar
                    </>
                  ) : (
                    <>
                      <Send className="mr-1 h-3 w-3" />
                      Publicar
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RegenerateImageButton({
  contentId,
  onRegenerate,
  hasImage,
}: {
  contentId: string;
  onRegenerate: (contentId: string) => Promise<void>;
  hasImage: boolean;
}) {
  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);

  async function handleRegenerate() {
    setRegenerating(true);
    setRegenError(null);
    try {
      await onRegenerate(contentId);
    } catch (err) {
      setRegenError(
        err instanceof Error ? err.message : "Error al regenerar imagen"
      );
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        size="sm"
        variant="outline"
        onClick={handleRegenerate}
        disabled={regenerating}
        className="border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10"
      >
        {regenerating ? (
          <>
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Generando imagen...
          </>
        ) : hasImage ? (
          <>
            <RefreshCw className="mr-1 h-3 w-3" />
            Regenerar imagen
          </>
        ) : (
          <>
            <ImagePlus className="mr-1 h-3 w-3" />
            Generar imagen
          </>
        )}
      </Button>
      {regenError && (
        <p className="text-xs text-red-400">{regenError}</p>
      )}
    </div>
  );
}

const VOICE_OPTIONS: Record<string, string> = {
  "es-MX-DaliaNeural": "Dalia (MX, femenina)",
  "es-CO-SalomeNeural": "Salome (CO, femenina)",
  "es-ES-ElviraNeural": "Elvira (ES, femenina)",
  "es-AR-ElenaNeural": "Elena (AR, femenina)",
  "es-MX-JorgeNeural": "Jorge (MX, masculino)",
  "es-CO-GonzaloNeural": "Gonzalo (CO, masculino)",
  "es-ES-AlvaroNeural": "Alvaro (ES, masculino)",
  "es-AR-TomasNeural": "Tomas (AR, masculino)",
  "en-US-EmmaMultilingualNeural": "Emma (US, multilingual)",
  "en-US-GuyNeural": "Guy (US, male)",
};

function VoiceSelector({
  contentId,
  currentVoice,
  onRegenerate,
}: {
  contentId: string;
  currentVoice: string;
  onRegenerate: (contentId: string, voice: string) => Promise<VoiceoverData>;
}) {
  const [selectedVoice, setSelectedVoice] = useState(currentVoice);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegenerate() {
    if (selectedVoice === currentVoice) return;
    setRegenerating(true);
    setError(null);
    try {
      await onRegenerate(contentId, selectedVoice);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al regenerar voz");
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={selectedVoice}
        onChange={(e) => setSelectedVoice(e.target.value)}
        disabled={regenerating}
        className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-300 focus:border-purple-500 focus:outline-none"
      >
        {Object.entries(VOICE_OPTIONS).map(([id, label]) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
      {selectedVoice !== currentVoice && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleRegenerate}
          disabled={regenerating}
          className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 text-xs h-7"
        >
          {regenerating ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-1 h-3 w-3" />
              Cambiar voz
            </>
          )}
        </Button>
      )}
      {error && <p className="w-full text-xs text-red-400">{error}</p>}
    </div>
  );
}

function UploadImageButton({
  contentId,
  onUpload,
}: {
  contentId: string;
  onUpload: (contentId: string, file: File) => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function handleClick() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp,image/gif";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("La imagen no debe superar 10MB");
        return;
      }
      setUploading(true);
      setUploadError(null);
      try {
        await onUpload(contentId, file);
      } catch (err) {
        setUploadError(
          err instanceof Error ? err.message : "Error al subir imagen"
        );
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }

  return (
    <div className="space-y-2">
      <Button
        size="sm"
        variant="outline"
        onClick={handleClick}
        disabled={uploading}
        className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
      >
        {uploading ? (
          <>
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Subiendo imagen...
          </>
        ) : (
          <>
            <Upload className="mr-1 h-3 w-3" />
            Subir imagen
          </>
        )}
      </Button>
      {uploadError && (
        <p className="text-xs text-red-400">{uploadError}</p>
      )}
    </div>
  );
}

export function PlatformPreview({
  variants,
  hook,
  script,
  callToAction,
  mediaUrls,
  contentId,
  accounts,
  publishStates,
  onPublish,
  voiceover,
  onRegenerateImage,
  onUploadImage,
  onRegenerateVoice,
}: PlatformPreviewProps) {
  const [currentVoiceover, setCurrentVoiceover] = useState<VoiceoverData | null | undefined>(voiceover);

  const handleRegenerateVoice = async (cId: string, voice: string): Promise<VoiceoverData> => {
    if (!onRegenerateVoice) throw new Error("No handler");
    const newVo = await onRegenerateVoice(cId, voice);
    setCurrentVoiceover(newVo);
    return newVo;
  };
  if (variants.length === 0) return null;

  const showPublish = contentId && accounts && publishStates && onPublish;
  const hasImage = !!mediaUrls && mediaUrls.length > 0;

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-300">
          Preview por plataforma
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={variants[0].platform}>
          <TabsList className="bg-slate-800">
            {variants.map((v) => (
              <TabsTrigger
                key={v.platform}
                value={v.platform}
                className="data-[state=active]:bg-slate-700"
              >
                <span className={platformConfig[v.platform].color}>
                  {platformConfig[v.platform].label}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {variants.map((v) => (
            <TabsContent key={v.platform} value={v.platform} className="space-y-4 pt-4">
              {/* Generated Image */}
              {hasImage && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-emerald-400">
                      Imagen
                    </span>
                    {contentId && (
                      <div className="flex items-center gap-2">
                        {onRegenerateImage && (
                          <RegenerateImageButton
                            contentId={contentId}
                            onRegenerate={onRegenerateImage}
                            hasImage
                          />
                        )}
                        {onUploadImage && (
                          <UploadImageButton
                            contentId={contentId}
                            onUpload={onUploadImage}
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="overflow-hidden rounded-lg border border-slate-700">
                    <img
                      src={mediaUrls![0].url}
                      alt="Imagen generada por IA"
                      className="w-full h-auto object-cover"
                      style={{ maxHeight: "400px" }}
                    />
                  </div>
                  {mediaUrls![0].width && mediaUrls![0].height && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Badge variant="outline" className="border-slate-700 text-slate-500">
                        {mediaUrls![0].width}x{mediaUrls![0].height}
                      </Badge>
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                        IA generada
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Generate/upload image button when no image exists */}
              {!hasImage && contentId && (onRegenerateImage || onUploadImage) && (
                <div className="rounded-lg border border-dashed border-slate-700 p-4 text-center space-y-3">
                  <ImagePlus className="mx-auto h-8 w-8 text-slate-600" />
                  <p className="text-xs text-slate-500">
                    Sin imagen. Genera una con IA o sube tu propia imagen.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    {onRegenerateImage && (
                      <RegenerateImageButton
                        contentId={contentId}
                        onRegenerate={onRegenerateImage}
                        hasImage={false}
                      />
                    )}
                    {onUploadImage && (
                      <UploadImageButton
                        contentId={contentId}
                        onUpload={onUploadImage}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Voiceover Audio Player */}
              {currentVoiceover?.url && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-3.5 w-3.5 text-purple-400" />
                    <span className="text-xs font-medium text-purple-400">
                      Voiceover ({currentVoiceover.durationSeconds}s)
                    </span>
                    <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-[10px]">
                      {currentVoiceover.voice.split("-").slice(0, 2).join("-")} Edge-TTS
                    </Badge>
                  </div>
                  <audio
                    controls
                    className="w-full h-8 [&::-webkit-media-controls-panel]:bg-slate-800"
                    preload="none"
                    key={currentVoiceover.url}
                  >
                    <source src={currentVoiceover.url} type="audio/mpeg" />
                  </audio>
                  {contentId && onRegenerateVoice && (
                    <VoiceSelector
                      contentId={contentId}
                      currentVoice={currentVoiceover.voice}
                      onRegenerate={handleRegenerateVoice}
                    />
                  )}
                </div>
              )}

              {/* Hook */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-indigo-400">
                    Hook (primeros 3 seg)
                  </span>
                  <CopyButton text={hook} />
                </div>
                <div className="rounded-md bg-indigo-600/10 p-3 text-sm text-white">
                  {hook}
                </div>
              </div>

              {/* Script */}
              {script && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">
                      Script
                    </span>
                    <CopyButton text={script} />
                  </div>
                  <div className="max-h-48 overflow-y-auto rounded-md bg-slate-800 p-3 text-sm text-slate-300 whitespace-pre-wrap">
                    {script}
                  </div>
                </div>
              )}

              {/* Caption */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">
                    Caption
                  </span>
                  <CopyButton text={v.caption} />
                </div>
                <div className="rounded-md bg-slate-800 p-3 text-sm text-slate-300 whitespace-pre-wrap">
                  {v.caption}
                </div>
              </div>

              {/* Hashtags */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">
                    Hashtags ({v.hashtags.length})
                  </span>
                  <CopyButton text={v.hashtags.join(" ")} />
                </div>
                <div className="flex flex-wrap gap-1">
                  {v.hashtags.map((h, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="bg-slate-800 text-indigo-300"
                    >
                      {h.startsWith("#") ? h : `#${h}`}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-400">
                  Call to Action
                </span>
                <div className="rounded-md bg-slate-800 p-3 text-sm text-yellow-300">
                  {callToAction}
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Badge variant="outline" className="border-slate-700 text-slate-500">
                  {v.aspectRatio}
                </Badge>
              </div>

              {/* Publish Section */}
              {showPublish && (
                <div className="mt-4 border-t border-slate-800 pt-4">
                  <PublishSection
                    platform={v.platform}
                    accounts={accounts}
                    publishStates={publishStates}
                    onPublish={onPublish}
                  />
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

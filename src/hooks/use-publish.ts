"use client";

import { useState, useCallback } from "react";

export type PublishStatus = "idle" | "publishing" | "published" | "error";

export interface PublishState {
  /** Key = socialAccountId */
  [accountId: string]: {
    status: PublishStatus;
    error?: string;
    platformPostUrl?: string;
  };
}

export function usePublish() {
  const [states, setStates] = useState<PublishState>({});

  const publish = useCallback(
    async (contentId: string, socialAccountId: string) => {
      setStates((prev) => ({
        ...prev,
        [socialAccountId]: { status: "publishing" },
      }));

      try {
        const res = await fetch("/api/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentId, socialAccountId }),
        });

        const json = await res.json();

        if (!json.success) {
          setStates((prev) => ({
            ...prev,
            [socialAccountId]: {
              status: "error",
              error: json.error?.message ?? "Error al publicar",
            },
          }));
          return false;
        }

        setStates((prev) => ({
          ...prev,
          [socialAccountId]: {
            status: "published",
            platformPostUrl: json.data?.platformPostUrl,
          },
        }));
        return true;
      } catch {
        setStates((prev) => ({
          ...prev,
          [socialAccountId]: {
            status: "error",
            error: "Error de conexión",
          },
        }));
        return false;
      }
    },
    []
  );

  const resetPublish = useCallback(() => {
    setStates({});
  }, []);

  return { publishStates: states, publish, resetPublish };
}

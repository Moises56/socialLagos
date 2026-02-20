"use client";

import { useState, useEffect, useCallback } from "react";

export interface ScheduledItem {
  id: string;
  contentId?: string;
  content: {
    type: string;
    caption: string;
    hook?: string;
  } | null;
  account: {
    id: string;
    platform: string;
    name: string;
    avatar?: string;
  } | null;
  platform: string;
  status: string;
  scheduledAt?: string;
  publishedAt?: string;
  platformPostUrl?: string;
  errorMessage?: string;
  createdAt: string;
}

export function useSchedule(from?: string, to?: string) {
  const [items, setItems] = useState<ScheduledItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await fetch(`/api/schedule?${params.toString()}`);
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message ?? "Error al cargar calendario");
        return;
      }
      setItems(json.data ?? []);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const cancelScheduled = useCallback(
    async (publicationId: string) => {
      try {
        const res = await fetch(`/api/schedule?id=${publicationId}`, {
          method: "DELETE",
        });
        const json = await res.json();
        if (!json.success) return false;
        await fetchSchedule();
        return true;
      } catch {
        return false;
      }
    },
    [fetchSchedule]
  );

  return { items, loading, error, cancelScheduled, refetch: fetchSchedule };
}

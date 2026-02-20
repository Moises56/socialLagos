"use client";

import { useState, useEffect, useCallback } from "react";

export interface SocialAccountData {
  id: string;
  platform: "facebook" | "tiktok" | "instagram";
  accountName: string;
  accountType: "page" | "profile" | "business";
  avatarUrl?: string;
  monetization: {
    status: "not_eligible" | "in_progress" | "eligible" | "active";
    currentFollowers: number;
    currentViews30d: number;
    currentWatchMinutes60d: number;
    targetFollowers: number;
    targetViews: number;
    targetWatchMinutes: number;
    lastSyncAt: string;
  };
  isActive: boolean;
  connectedAt: string;
}

export function useSocialAccounts() {
  const [accounts, setAccounts] = useState<SocialAccountData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/social/accounts");
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message ?? "Error al cargar cuentas");
        return;
      }
      setAccounts(json.data ?? []);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const disconnect = useCallback(
    async (accountId: string) => {
      try {
        setDisconnecting(accountId);
        const res = await fetch("/api/social/disconnect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId }),
        });
        const json = await res.json();
        if (!json.success) {
          setError(json.error?.message ?? "Error al desconectar");
          return false;
        }
        await fetchAccounts();
        return true;
      } catch {
        setError("Error de conexión");
        return false;
      } finally {
        setDisconnecting(null);
      }
    },
    [fetchAccounts]
  );

  return { accounts, loading, error, disconnecting, disconnect, refetch: fetchAccounts };
}

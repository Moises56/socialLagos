"use client";

import { useState, useEffect, useCallback } from "react";

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: string;
  usage: {
    contentGenerated: number;
    postsPublished: number;
    storageUsedMB: number;
    periodStart: string;
    periodEnd: string;
  };
  defaults: {
    language: string;
    timezone: string;
    defaultTone?: string;
    defaultNiche?: string;
  };
  createdAt: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/user/profile");
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message ?? "Error al cargar perfil");
        return;
      }
      setProfile(json.data);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (data: Record<string, unknown>) => {
      try {
        setSaving(true);
        setError(null);
        const res = await fetch("/api/user/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!json.success) {
          setError(json.error?.message ?? "Error al guardar");
          return false;
        }
        await fetchProfile();
        return true;
      } catch {
        setError("Error de conexión");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetchProfile]
  );

  const changePassword = useCallback(
    async (data: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      try {
        setSaving(true);
        setError(null);
        const res = await fetch("/api/user/password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!json.success) {
          setError(json.error?.message ?? "Error al cambiar contraseña");
          return false;
        }
        return true;
      } catch {
        setError("Error de conexión");
        return false;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  return { profile, loading, error, saving, updateProfile, changePassword, refetch: fetchProfile };
}

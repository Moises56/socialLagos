"use client";

import { Loader2, AlertTriangle } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { ProfileForm } from "./_components/profile-form";
import { PasswordForm } from "./_components/password-form";
import { PreferencesForm } from "./_components/preferences-form";

export default function SettingsPage() {
  const { profile, loading, error, saving, updateProfile, changePassword } =
    useProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración</h1>
        <p className="text-slate-400">
          Administra tu cuenta, contraseña y preferencias
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <span className="text-sm text-red-300">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
        </div>
      ) : profile ? (
        <div className="space-y-6">
          <ProfileForm
            profile={profile}
            onSave={updateProfile}
            saving={saving}
          />
          <PreferencesForm
            profile={profile}
            onSave={updateProfile}
            saving={saving}
          />
          <PasswordForm
            onChangePassword={changePassword}
            saving={saving}
          />
        </div>
      ) : null}
    </div>
  );
}

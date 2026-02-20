"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, CheckCircle2, AlertTriangle } from "lucide-react";

interface PasswordFormProps {
  onChangePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<boolean>;
  saving: boolean;
}

export function PasswordForm({ onChangePassword, saving }: PasswordFormProps) {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (newPass !== confirm) {
      setLocalError("Las contraseñas no coinciden");
      return;
    }

    if (newPass.length < 8) {
      setLocalError("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    const ok = await onChangePassword({
      currentPassword: current,
      newPassword: newPass,
      confirmPassword: confirm,
    });

    if (ok) {
      setSuccess(true);
      setCurrent("");
      setNewPass("");
      setConfirm("");
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Lock className="h-5 w-5 text-indigo-400" />
          Cambiar contraseña
        </CardTitle>
        <CardDescription className="text-slate-400">
          Actualiza tu contraseña de acceso
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current" className="text-slate-300">
              Contraseña actual
            </Label>
            <Input
              id="current"
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="border-slate-700 bg-slate-950 text-white"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-slate-300">
                Nueva contraseña
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="border-slate-700 bg-slate-950 text-white"
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-slate-300">
                Confirmar contraseña
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="border-slate-700 bg-slate-950 text-white"
                required
              />
            </div>
          </div>

          {localError && (
            <div className="flex items-center gap-2 text-sm text-red-400">
              <AlertTriangle className="h-4 w-4" />
              {localError}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={saving || !current || !newPass || !confirm}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cambiando...
                </>
              ) : (
                "Cambiar contraseña"
              )}
            </Button>
            {success && (
              <span className="flex items-center gap-1 text-sm text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Contraseña actualizada
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

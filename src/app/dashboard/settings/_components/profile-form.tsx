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
import { Badge } from "@/components/ui/badge";
import { Loader2, User, CheckCircle2 } from "lucide-react";
import type { ProfileData } from "@/hooks/use-profile";
import { PLANS } from "@/lib/utils/constants";

interface ProfileFormProps {
  profile: ProfileData;
  onSave: (data: Record<string, unknown>) => Promise<boolean>;
  saving: boolean;
}

export function ProfileForm({ profile, onSave, saving }: ProfileFormProps) {
  const [name, setName] = useState(profile.name);
  const [saved, setSaved] = useState(false);

  const plan = PLANS[profile.plan as keyof typeof PLANS];
  const usagePercent = plan
    ? Math.round((profile.usage.contentGenerated / plan.contentPerMonth) * 100)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSave({ name });
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <User className="h-5 w-5 text-indigo-400" />
          Perfil
        </CardTitle>
        <CardDescription className="text-slate-400">
          Tu información personal y plan actual
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">
                Nombre
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-slate-700 bg-slate-950 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Email</Label>
              <Input
                value={profile.email}
                disabled
                className="border-slate-700 bg-slate-950/50 text-slate-500"
              />
            </div>
          </div>

          {/* Plan info */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">Plan actual</span>
                <Badge className="bg-indigo-500/20 text-indigo-400">
                  {plan?.name ?? profile.plan}
                </Badge>
              </div>
              <span className="text-xs text-slate-500">
                Período: {new Date(profile.usage.periodStart).toLocaleDateString("es-ES")} -{" "}
                {new Date(profile.usage.periodEnd).toLocaleDateString("es-ES")}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-white">
                  {profile.usage.contentGenerated}
                  <span className="text-xs font-normal text-slate-500">
                    /{plan?.contentPerMonth ?? "∞"}
                  </span>
                </p>
                <p className="text-[10px] text-slate-500">Contenido generado</p>
              </div>
              <div>
                <p className="text-lg font-bold text-white">
                  {profile.usage.postsPublished}
                  <span className="text-xs font-normal text-slate-500">
                    /{plan?.postsPerMonth ?? "∞"}
                  </span>
                </p>
                <p className="text-[10px] text-slate-500">Posts publicados</p>
              </div>
              <div>
                <p className="text-lg font-bold text-white">
                  {profile.usage.storageUsedMB.toFixed(1)}
                  <span className="text-xs font-normal text-slate-500">
                    /{plan?.storageMB ?? "∞"} MB
                  </span>
                </p>
                <p className="text-[10px] text-slate-500">Almacenamiento</p>
              </div>
            </div>
            {usagePercent > 80 && (
              <p className="mt-2 text-[10px] text-yellow-400">
                Has usado el {usagePercent}% de tu límite de contenido mensual
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving || name === profile.name}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
            {saved && (
              <span className="flex items-center gap-1 text-sm text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Guardado
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

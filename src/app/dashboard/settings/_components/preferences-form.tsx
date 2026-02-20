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
import { Loader2, Settings, CheckCircle2 } from "lucide-react";
import type { ProfileData } from "@/hooks/use-profile";

const TONES = [
  { value: "educational", label: "Educativo" },
  { value: "entertainment", label: "Entretenimiento" },
  { value: "inspirational", label: "Inspiracional" },
  { value: "controversial", label: "Polémico" },
  { value: "storytelling", label: "Storytelling" },
];

const LANGUAGES = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
  { value: "pt", label: "Português" },
];

const TIMEZONES = [
  { value: "America/Tegucigalpa", label: "Honduras (GMT-6)" },
  { value: "America/Mexico_City", label: "México (GMT-6)" },
  { value: "America/Bogota", label: "Colombia (GMT-5)" },
  { value: "America/Lima", label: "Perú (GMT-5)" },
  { value: "America/New_York", label: "Este EEUU (GMT-5)" },
  { value: "America/Buenos_Aires", label: "Argentina (GMT-3)" },
  { value: "Europe/Madrid", label: "España (GMT+1)" },
];

interface PreferencesFormProps {
  profile: ProfileData;
  onSave: (data: Record<string, unknown>) => Promise<boolean>;
  saving: boolean;
}

export function PreferencesForm({ profile, onSave, saving }: PreferencesFormProps) {
  const [language, setLanguage] = useState(profile.defaults.language);
  const [timezone, setTimezone] = useState(profile.defaults.timezone);
  const [tone, setTone] = useState(profile.defaults.defaultTone ?? "");
  const [niche, setNiche] = useState(profile.defaults.defaultNiche ?? "");
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSave({
      defaults: {
        language,
        timezone,
        defaultTone: tone || undefined,
        defaultNiche: niche || undefined,
      },
    });
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Settings className="h-5 w-5 text-indigo-400" />
          Preferencias de generación
        </CardTitle>
        <CardDescription className="text-slate-400">
          Valores por defecto al crear contenido nuevo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="language" className="text-slate-300">
                Idioma
              </Label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex h-9 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-slate-300">
                Zona horaria
              </Label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="flex h-9 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {TIMEZONES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tone" className="text-slate-300">
                Tono por defecto
              </Label>
              <select
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="flex h-9 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Sin preferencia</option>
                {TONES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="niche" className="text-slate-300">
                Nicho por defecto
              </Label>
              <Input
                id="niche"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="Ej: fitness, cocina, tecnología..."
                className="border-slate-700 bg-slate-950 text-white placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar preferencias"
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

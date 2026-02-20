"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
      <AlertTriangle className="h-12 w-12 text-red-400" />
      <h2 className="text-lg font-semibold text-white">Algo salió mal</h2>
      <p className="text-sm text-slate-400">
        {error.message || "Ha ocurrido un error inesperado"}
      </p>
      <Button
        onClick={reset}
        variant="outline"
        className="border-slate-700 text-slate-300 hover:bg-slate-800"
      >
        Intentar de nuevo
      </Button>
    </div>
  );
}

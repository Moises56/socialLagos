"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { useSocialAccounts } from "@/hooks/use-social-accounts";
import { AccountConnector } from "./_components/account-connector";
import { ConnectedAccountCard } from "./_components/connected-account-card";
import type { Platform } from "@/lib/utils/constants";

export default function AccountsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { accounts, loading, error, disconnecting, disconnect, refetch } =
    useSocialAccounts();

  const connectedParam = searchParams.get("connected");
  const errorParam = searchParams.get("error");
  const [dismissed, setDismissed] = useState(false);

  // Refetch when returning from OAuth
  useEffect(() => {
    if (connectedParam) {
      refetch();
    }
  }, [connectedParam, refetch]);

  // Reset dismissed when params change
  useEffect(() => {
    setDismissed(false);
  }, [connectedParam, errorParam]);

  const dismissBanner = () => {
    setDismissed(true);
    router.replace("/dashboard/accounts");
  };

  const connectedPlatforms = accounts.map((a) => a.platform) as Platform[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Cuentas sociales</h1>
        <p className="text-slate-400">
          Conecta y administra tus cuentas de redes sociales
        </p>
      </div>

      {/* OAuth feedback banners */}
      {connectedParam && !dismissed && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-emerald-300">
              Cuenta de{" "}
              <span className="font-semibold capitalize">{connectedParam}</span>{" "}
              conectada exitosamente
            </span>
          </div>
          <button onClick={dismissBanner} className="text-emerald-400 hover:text-emerald-300">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {errorParam && !dismissed && (
        <div className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-sm text-red-300">
              Error al conectar: {decodeURIComponent(errorParam)}
            </span>
          </div>
          <button onClick={dismissBanner} className="text-red-400 hover:text-red-300">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Connect new platform */}
      <AccountConnector connectedPlatforms={connectedPlatforms} />

      {/* Connected accounts */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-indigo-400" />
                Cuentas conectadas
              </CardTitle>
              <CardDescription className="text-slate-400">
                Administra y monitorea tus cuentas vinculadas
              </CardDescription>
            </div>
            {!loading && (
              <Badge className="bg-indigo-500/20 text-indigo-400">
                {accounts.length} cuenta{accounts.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          ) : error ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2 text-slate-500">
              <Users className="h-8 w-8" />
              <p className="text-sm">
                No hay cuentas conectadas. Usa los botones de arriba para vincular
                tus redes sociales.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account) => (
                <ConnectedAccountCard
                  key={account.id}
                  account={account}
                  onDisconnect={disconnect}
                  disconnecting={disconnecting === account.id}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

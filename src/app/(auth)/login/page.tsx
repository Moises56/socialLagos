"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email o contraseña incorrectos");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-white">
          Iniciar sesión
        </CardTitle>
        <CardDescription className="text-slate-400">
          Accede a tu cuenta de SocialForge
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
              className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">
              Contraseña
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Tu contraseña"
              required
              className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Iniciar sesión
          </Button>
          <p className="text-sm text-slate-400">
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Regístrate gratis
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

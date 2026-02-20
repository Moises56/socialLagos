import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Target,
  BarChart3,
  Calendar,
  Globe,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Generación con IA",
    description:
      "Scripts, captions, hashtags y hooks optimizados generados por inteligencia artificial avanzada.",
  },
  {
    icon: Globe,
    title: "Multi-plataforma",
    description:
      "Publica en Facebook, TikTok e Instagram. Contenido adaptado automáticamente para cada red.",
  },
  {
    icon: Calendar,
    title: "Programación inteligente",
    description:
      "Programa tu contenido en los horarios de mayor engagement para maximizar alcance.",
  },
  {
    icon: Target,
    title: "Monetización acelerada",
    description:
      "Trackea tu progreso hacia la monetización con proyecciones y recomendaciones.",
  },
  {
    icon: BarChart3,
    title: "Analytics avanzados",
    description:
      "Métricas en tiempo real, análisis de rendimiento y optimización basada en datos.",
  },
  {
    icon: Zap,
    title: "Contenido original",
    description:
      "Variantes únicas por plataforma. Sin duplicados, sin penalizaciones algorítmicas.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-20 text-center lg:py-32">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-400">
            Acelera tu monetización en redes sociales
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white lg:text-6xl">
            Genera, publica y monetiza contenido con{" "}
            <span className="text-indigo-400">inteligencia artificial</span>
          </h1>
          <p className="mb-8 text-lg text-slate-400 lg:text-xl">
            SocialForge automatiza la creación de contenido original para Facebook,
            TikTok e Instagram. Alcanza los requisitos de monetización en tiempo
            récord.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="bg-indigo-600 px-8 hover:bg-indigo-700"
              asChild
            >
              <Link href="/register">Comenzar gratis</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              asChild
            >
              <Link href="/pricing">Ver precios</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-800 bg-slate-900/30 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">
              Todo lo que necesitas para crecer
            </h2>
            <p className="text-lg text-slate-400">
              Una plataforma completa para dominar las redes sociales
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-colors hover:border-indigo-500/30"
              >
                <feature.icon className="mb-4 h-10 w-10 text-indigo-400" />
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Empieza a monetizar hoy
          </h2>
          <p className="mb-8 text-lg text-slate-400">
            Únete a miles de creadores que ya están generando ingresos con
            SocialForge. Comienza gratis, escala cuando quieras.
          </p>
          <Button
            size="lg"
            className="bg-indigo-600 px-8 hover:bg-indigo-700"
            asChild
          >
            <Link href="/register">Crear cuenta gratis</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

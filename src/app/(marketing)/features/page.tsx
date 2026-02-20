import {
  Sparkles,
  Globe,
  Calendar,
  Target,
  BarChart3,
  Zap,
  Shield,
  Headphones,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Generación de contenido con IA",
    description:
      "Genera scripts profesionales, captions magnéticos, hashtags optimizados y hooks que capturan la atención en los primeros 3 segundos. Powered by GPT-4o y Claude.",
  },
  {
    icon: Globe,
    title: "Publicación multi-plataforma",
    description:
      "Publica en Facebook, TikTok e Instagram desde un solo dashboard. El contenido se adapta automáticamente a cada plataforma con variantes únicas.",
  },
  {
    icon: Calendar,
    title: "Programación inteligente",
    description:
      "Calendario visual para programar tus publicaciones. Sugerencias de horarios óptimos basadas en el engagement de tu audiencia.",
  },
  {
    icon: Target,
    title: "Tracker de monetización",
    description:
      "Visualiza tu progreso hacia los requisitos de monetización de cada plataforma. Proyecciones basadas en tu crecimiento actual.",
  },
  {
    icon: BarChart3,
    title: "Analytics avanzados",
    description:
      "Métricas detalladas de rendimiento por plataforma, tipo de contenido y período. Identifica qué funciona y optimiza tu estrategia.",
  },
  {
    icon: Zap,
    title: "Contenido original garantizado",
    description:
      "Cada pieza de contenido es única. Generamos variantes por plataforma para evitar penalizaciones por contenido duplicado.",
  },
  {
    icon: Headphones,
    title: "Voiceover con IA",
    description:
      "Genera narración profesional para tus videos con voces naturales de ElevenLabs. Múltiples voces y estilos disponibles.",
  },
  {
    icon: Shield,
    title: "Seguridad enterprise",
    description:
      "Tokens de redes sociales encriptados con AES-256-GCM. Autenticación segura y rate limiting por plan.",
  },
];

export default function FeaturesPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">
          Funcionalidades potentes para creadores
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-400">
          Todas las herramientas que necesitas para crear, publicar y monetizar
          contenido en redes sociales.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-600/10">
              <feature.icon className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-slate-400">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: 0,
    description: "Para probar la plataforma",
    features: [
      "5 contenidos/mes",
      "10 publicaciones/mes",
      "1 cuenta social",
      "100 MB almacenamiento",
      "Generación básica con IA",
    ],
    cta: "Comenzar gratis",
    popular: false,
  },
  {
    name: "Starter",
    price: 19,
    description: "Para creadores individuales",
    features: [
      "30 contenidos/mes",
      "60 publicaciones/mes",
      "3 cuentas sociales",
      "1 GB almacenamiento",
      "Generación avanzada con IA",
      "Programación de posts",
      "Analytics básicos",
    ],
    cta: "Comenzar prueba",
    popular: false,
  },
  {
    name: "Growth",
    price: 49,
    description: "Para creadores serios",
    features: [
      "100 contenidos/mes",
      "200 publicaciones/mes",
      "10 cuentas sociales",
      "5 GB almacenamiento",
      "IA premium (GPT-4o + Claude)",
      "Programación avanzada",
      "Analytics completos",
      "Tracker de monetización",
      "Voiceover con IA",
    ],
    cta: "Comenzar prueba",
    popular: true,
  },
  {
    name: "Agency",
    price: 149,
    description: "Para agencias y equipos",
    features: [
      "500 contenidos/mes",
      "1000 publicaciones/mes",
      "50 cuentas sociales",
      "25 GB almacenamiento",
      "Todos los modelos de IA",
      "API access",
      "Soporte prioritario",
      "White-label (próximamente)",
    ],
    cta: "Contactar ventas",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">
          Planes simples, precios transparentes
        </h1>
        <p className="text-lg text-slate-400">
          Elige el plan que mejor se adapte a tus necesidades. Escala cuando quieras.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative border-slate-800 bg-slate-900/50 ${
              plan.popular ? "border-indigo-500 ring-1 ring-indigo-500" : ""
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600">
                Más popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="text-white">{plan.name}</CardTitle>
              <CardDescription className="text-slate-400">
                {plan.description}
              </CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold text-white">
                  ${plan.price}
                </span>
                <span className="text-slate-400">/mes</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="h-4 w-4 shrink-0 text-indigo-400" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className={`w-full ${
                  plan.popular
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800"
                }`}
                variant={plan.popular ? "default" : "outline"}
                asChild
              >
                <Link href="/register">{plan.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}

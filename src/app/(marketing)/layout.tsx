import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
              S
            </div>
            <span className="text-lg font-bold text-white">SocialForge</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/features"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Funcionalidades
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Precios
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-slate-300 hover:text-white" asChild>
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" asChild>
              <Link href="/register">Comenzar gratis</Link>
            </Button>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t border-slate-800 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500">
          <div className="mb-3 flex items-center justify-center gap-4">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
            <span>&middot;</span>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
          </div>
          &copy; {new Date().getFullYear()} SocialForge. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}

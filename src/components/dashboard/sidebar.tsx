"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  PenTool,
  Library,
  CalendarDays,
  Users,
  BarChart3,
  TrendingUp,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/dashboard/create", label: "Crear contenido", icon: PenTool },
  { href: "/dashboard/library", label: "Biblioteca", icon: Library },
  { href: "/dashboard/schedule", label: "Programar", icon: CalendarDays },
  { href: "/dashboard/accounts", label: "Cuentas", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/monetization", label: "Monetización", icon: TrendingUp },
  { href: "/dashboard/settings", label: "Configuración", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-slate-800 bg-slate-950 lg:block">
      <div className="flex h-16 items-center border-b border-slate-800 px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
            S
          </div>
          <span className="text-lg font-bold text-white">SocialForge</span>
        </Link>
      </div>
      <nav className="space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-600/10 text-indigo-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

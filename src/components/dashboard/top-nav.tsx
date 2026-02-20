"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Menu, LogOut, Settings, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileSidebar } from "./mobile-sidebar";

export function TopNav() {
  const { data: session } = useSession();
  const user = session?.user;
  const plan = (user as Record<string, unknown> | undefined)?.plan as string | undefined;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "SF";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden text-slate-400">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-slate-800 bg-slate-950 p-0">
            <MobileSidebar />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-4">
        {plan && (
          <Badge variant="outline" className="border-indigo-500/50 text-indigo-400">
            Plan {plan.charAt(0).toUpperCase() + plan.slice(1)}
          </Badge>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.image ?? undefined} />
                <AvatarFallback className="bg-indigo-600 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-slate-800 bg-slate-900">
            <div className="flex items-center gap-2 p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem className="text-slate-300 focus:bg-slate-800 focus:text-white">
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem className="text-slate-300 focus:bg-slate-800 focus:text-white">
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem
              className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

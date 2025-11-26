"use client";

import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  PawPrint, 
  Users, 
  Settings,
  Scissors,
  History,
  UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userRole: string | null;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard, requiresAdmin: true },
    { href: "/agendamentos", label: "Agendamentos", icon: Calendar, requiresAdmin: false },
    { href: "/agendamentos/historico", label: "Histórico", icon: History, requiresAdmin: true },
    { href: "/pets", label: "Pets", icon: PawPrint, requiresAdmin: false },
    { href: "/clientes", label: "Clientes", icon: Users, requiresAdmin: false },
    { href: "/servicos", label: "Serviços", icon: Scissors, requiresAdmin: false },
    { href: "/usuarios", label: "Usuários", icon: UserPlus, requiresAdmin: true },
    { href: "/configuracoes", label: "Configurações", icon: Settings, requiresAdmin: false },
  ].filter((item) => !item.requiresAdmin || userRole === "ADMIN");

  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Navigating to:", href);
    
    // Usar window.location diretamente para garantir que funcione
    window.location.href = href;
  };

  return (
    <aside className="hidden w-64 border-r bg-card lg:block relative z-10">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-xl font-bold text-primary">PetCare Manager</h1>
        </div>
        <nav className="flex-1 space-y-1 p-4 relative z-10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== "/" && pathname?.startsWith(item.href));
            
            return (
              <button
                key={item.href}
                onClick={(e) => handleNavigation(item.href, e)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer text-left",
                  isActive
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}


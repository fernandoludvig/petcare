"use client";

import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  PawPrint, 
  Users, 
  Settings,
  Scissors
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agendamentos", label: "Agendamentos", icon: Calendar },
  { href: "/pets", label: "Pets", icon: PawPrint },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/servicos", label: "Serviços", icon: Scissors },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Navigating to:", href);
    window.location.href = href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t bg-card lg:hidden">
      {navItems.slice(0, 5).map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || 
          (item.href !== "/" && pathname?.startsWith(item.href));
        
        return (
          <button
            key={item.href}
            onClick={(e) => handleNavigation(item.href, e)}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 text-xs",
              isActive
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}


"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users } from "lucide-react";
import { ClientConfig } from "@/config/sheets";

export function SidebarNav({ clients }: { clients: ClientConfig[] }) {
  const pathname = usePathname();

  return (
    <nav className="grid items-start px-4 text-sm font-medium">
      <Link
        href="/"
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
          pathname === "/" ? "bg-sidebar-accent text-primary" : "text-muted-foreground"
        )}
      >
        <LayoutDashboard className="h-4 w-4" />
        Visão Geral
      </Link>
      
      <div className="mt-6 mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground/50 tracking-wider">
        Clientes ({clients.length})
      </div>
      
      {clients.map((client) => (
        <Link
          key={client.slug}
          href={`/client/${client.slug}`}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary group relative",
            pathname === `/client/${client.slug}` 
              ? "bg-sidebar-accent text-primary" 
              : "text-muted-foreground"
          )}
        >
          <Users className="h-4 w-4" />
          <span className="truncate max-w-[140px]">{client.name}</span>
        </Link>
      ))}
    </nav>
  );
}

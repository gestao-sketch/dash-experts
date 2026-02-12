"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Rocket, TrendingUp, TrendingDown, Minus, CheckCircle2, AlertTriangle } from "lucide-react";
import { ClientConfig } from "@/config/sheets";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SidebarNav({ clients }: { clients: ClientConfig[] }) {
  const pathname = usePathname();
  const [statusMap, setStatusMap] = useState<Record<string, { classificacao: string; tendencia: string }>>({});

  useEffect(() => {
    // Busca status dos clientes em background para não bloquear navegação
    fetch('/api/clients-status')
      .then(res => res.json())
      .then(data => setStatusMap(data))
      .catch(err => console.error("Falha ao carregar status menu:", err));
  }, []);

  const getStatusIcon = (slug: string) => {
    const status = statusMap[slug];
    if (!status) return null;

    const { classificacao, tendencia } = status;
    const isEscalar = classificacao.toUpperCase().includes("ESCALAR");
    const isRisco = classificacao.toUpperCase().includes("RISCO");
    const isSubindo = tendencia.toUpperCase().includes("SUBINDO");
    const isDescendo = tendencia.toUpperCase().includes("DESCENDO");

    return (
      <div className="ml-auto flex items-center gap-1.5 opacity-80" onClick={(e) => e.stopPropagation()}>
        {isEscalar && (
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <div className="relative group cursor-help">
                            <div className="absolute inset-0 bg-green-500/30 blur-sm rounded-full animate-pulse" />
                            <Rocket className="h-3.5 w-3.5 text-green-500 relative z-10" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-green-950 border-green-800 text-green-100 text-xs font-bold uppercase tracking-wide">
                        Escalar
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )}
        {isRisco && (
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <div className="cursor-help">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-red-950 border-red-800 text-red-100 text-xs font-bold uppercase tracking-wide">
                        Em Risco
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )}
        
        {/* Tendência sutil se não for escalar */}
        {!isEscalar && isSubindo && (
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <div className="cursor-help">
                            <TrendingUp className="h-3 w-3 text-emerald-500/70" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-zinc-950 border-zinc-800 text-emerald-400 text-xs font-bold uppercase tracking-wide">
                        Tendência de Alta
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )}
        {isDescendo && (
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <div className="cursor-help">
                            <TrendingDown className="h-3 w-3 text-rose-500/70" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-zinc-950 border-zinc-800 text-rose-400 text-xs font-bold uppercase tracking-wide">
                        Tendência de Baixa
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )}
      </div>
    );
  };

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
          
          {getStatusIcon(client.slug)}
        </Link>
      ))}
    </nav>
  );
}

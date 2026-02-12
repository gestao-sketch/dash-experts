"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metrics } from "@/config/sheets";
import { Rocket, TrendingUp, AlertTriangle } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface ScalingOpportunitiesCardProps {
  data: Metrics[];
}

export function ScalingOpportunitiesCard({ data }: ScalingOpportunitiesCardProps) {
  // 1. Agrupar dados por expert e encontrar o status mais recente de cada um
  const expertStatus: Record<string, { classificacao: string; tendencia: string; lastDate: Date; metricas: Metrics }> = {};

  data.forEach(item => {
      if (!item.clientName) return;
      
      const parts = item.date.split('/');
      const date = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
      
      if (!expertStatus[item.clientName] || date > expertStatus[item.clientName].lastDate) {
          // Atualiza se for uma data mais recente, mas apenas se tiver classificação
          if (item.classificacao) {
             expertStatus[item.clientName] = {
                 classificacao: item.classificacao,
                 tendencia: item.tendencia || "N/A",
                 lastDate: date,
                 metricas: item
             };
          }
      }
  });

  // 2. Filtrar apenas os que estão em ESCALAR
  const scalingExperts = Object.entries(expertStatus)
    .filter(([_, status]) => status.classificacao.toUpperCase().includes("ESCALAR"))
    .map(([name, status]) => ({ name, ...status }))
    .sort((a, b) => b.metricas.deposits - a.metricas.deposits); // Ordenar por volume de depósitos do dia

  if (scalingExperts.length === 0) return null;

  return (
    <Card className="col-span-4 border-green-500/30 bg-green-500/5 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-3 opacity-10">
          <Rocket className="w-24 h-24 text-green-500" />
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-green-500 animate-pulse" />
            <CardTitle className="text-base font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">
                Oportunidades de Escala
            </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        <ScrollArea className="w-full whitespace-nowrap pb-2">
            <div className="flex gap-3">
                {scalingExperts.map((expert, idx) => (
                    <div key={idx} className="flex flex-col min-w-[200px] p-3 rounded-lg bg-background/60 border border-green-500/20 backdrop-blur-sm shadow-sm hover:shadow-md transition-all hover:bg-background/80">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm truncate max-w-[140px]" title={expert.name}>{expert.name}</span>
                            {expert.tendencia.includes("SUBINDO") && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground uppercase">Depósitos (Dia)</span>
                                <span className="font-mono font-bold text-green-600 dark:text-green-400">
                                    R$ {expert.metricas.deposits.toLocaleString('pt-BR', { notation: "compact" })}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground uppercase">ROAS</span>
                                <span className="font-mono font-bold">
                                    {expert.metricas.roas.toFixed(2)}x
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

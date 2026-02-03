"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metrics } from "@/config/sheets";
import { Trophy, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface TopExpertsCardProps {
  data: Metrics[];
}

export function TopExpertsCard({ data }: TopExpertsCardProps) {
  const clientStats: Record<string, { 
    name: string; 
    deposits: number; 
    score: number; 
    count: number; 
  }> = {};

  data.forEach(item => {
    if (!item.clientName) return;
    
    if (!clientStats[item.clientName]) {
      clientStats[item.clientName] = { name: item.clientName, deposits: 0, score: 0, count: 0 };
    }
    
    clientStats[item.clientName].deposits += item.deposits;
    clientStats[item.clientName].score += item.grupo_score;
    clientStats[item.clientName].count += 1;
  });

  // Ranking completo ordenado
  const allExperts = Object.values(clientStats)
    .map(c => ({
      ...c,
      avgScore: c.count > 0 ? c.score / c.count : 0,
    }))
    .sort((a, b) => b.deposits - a.deposits);

  // Lista Top 5 para exibição em barras
  const top5 = allExperts.slice(0, 5);

  // Cores para o ranking (Top 5)
  const rankingColors = [
    "bg-emerald-500", 
    "bg-blue-500", 
    "bg-violet-500", 
    "bg-amber-500", 
    "bg-rose-500"
  ];
  
  // Paleta estendida de cores HEX para o gráfico (suporta mais experts)
  const pieColors = [
    "#10b981", // Emerald
    "#3b82f6", // Blue
    "#8b5cf6", // Violet
    "#f59e0b", // Amber
    "#ef4444", // Rose
    "#06b6d4", // Cyan
    "#ec4899", // Pink
    "#84cc16", // Lime
    "#f97316", // Orange
    "#6366f1", // Indigo
    "#14b8a6", // Teal
    "#d946ef", // Fuchsia
    "#eab308", // Yellow
    "#64748b", // Slate
  ];

  const maxDeposits = top5.length > 0 ? top5[0].deposits : 1;

  return (
    <Card className="col-span-1 lg:col-span-3 border-border/50 bg-card/95 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Top Experts (Depósitos)</CardTitle>
        <Trophy className="h-4 w-4 text-yellow-500" />
      </CardHeader>
      <CardContent className="pt-4 flex-1 flex flex-col">
        {/* Lista Top 5 */}
        <div className="space-y-5 flex-1">
          {top5.map((expert, idx) => (
            <div key={idx} className="group">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <div className="flex items-center gap-3">
                  <div className={`
                    flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white
                    ${rankingColors[idx] || "bg-gray-500"} shadow-sm
                  `}>
                    {idx + 1}
                  </div>
                  <span className="font-medium truncate max-w-[120px] sm:max-w-[200px]" title={expert.name}>
                    {expert.name}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-muted-foreground text-xs" title="Média Score Grupo">
                        <TrendingUp className="h-3 w-3" />
                        <span>{expert.avgScore.toFixed(1)}</span>
                    </div>
                    <div className="font-mono font-bold text-foreground">
                        R$ {expert.deposits.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                </div>
              </div>

              <div className="relative h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ease-out ${rankingColors[idx] || "bg-gray-500"}`}
                  style={{ width: `${(expert.deposits / maxDeposits) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Gráfico de Pizza com TODOS os experts */}
        {allExperts.length > 0 && (
            <div className="h-[320px] w-full mt-6 border-t border-border/50 pt-4">
               <p className="text-[10px] font-bold text-muted-foreground mb-2 text-center uppercase tracking-widest">Share Total de Faturamento</p>
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={allExperts}
                     cx="50%"
                     cy="45%"
                     labelLine={false}
                     outerRadius={95} // Raio aumentado
                     fill="#8884d8"
                     dataKey="deposits"
                     stroke="none"
                   >
                     {allExperts.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                     ))}
                   </Pie>
                   <Tooltip 
                     formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 'Depósitos']}
                     contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fafafa', fontSize: '12px', borderRadius: '8px', padding: '12px' }}
                     itemStyle={{ color: '#fafafa' }}
                   />
                   <Legend 
                     verticalAlign="bottom" 
                     height={80} // Altura maior para caber mais itens
                     iconType="circle"
                     iconSize={8}
                     wrapperStyle={{ fontSize: '11px', overflowY: 'auto' }} // Scroll se tiver muitos
                     formatter={(value, entry: any) => (
                       <span className="text-muted-foreground ml-1 font-medium">{entry.payload.name}</span>
                     )}
                   />
                 </PieChart>
               </ResponsiveContainer>
            </div>
        )}

        {allExperts.length === 0 && (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
              Sem dados de depósitos no período.
            </div>
        )}
      </CardContent>
    </Card>
  );
}

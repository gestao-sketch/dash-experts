"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Metrics } from "@/config/sheets";
import { Trophy, TrendingUp, DollarSign } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface TopExpertsCardProps {
  data: Metrics[];
}

export function TopExpertsCard({ data }: TopExpertsCardProps) {
  const [metric, setMetric] = useState<'deposits' | 'sales'>('deposits');

  const clientStats: Record<string, { 
    name: string; 
    deposits: number; 
    sales: number;
    score: number; 
    count: number; 
  }> = {};

  let hasSalesData = false;

  data.forEach(item => {
    if (!item.clientName) return;
    
    if (!clientStats[item.clientName]) {
      clientStats[item.clientName] = { name: item.clientName, deposits: 0, sales: 0, score: 0, count: 0 };
    }
    
    clientStats[item.clientName].deposits += item.deposits;
    clientStats[item.clientName].score += item.grupo_score;
    clientStats[item.clientName].count += 1;
    
    if (item.valor_total && item.valor_total > 0) {
        clientStats[item.clientName].sales += item.valor_total;
        hasSalesData = true;
    }
  });

  // Se não tiver dados de vendas, força depósitos
  const currentMetric = hasSalesData ? metric : 'deposits';

  // Ranking completo ordenado pela métrica atual
  const allExperts = Object.values(clientStats)
    .map(c => ({
      ...c,
      avgScore: c.count > 0 ? c.score / c.count : 0,
      value: currentMetric === 'deposits' ? c.deposits : c.sales
    }))
    .sort((a, b) => b.value - a.value);

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
    "#60a5fa", // Blue 400
    "#34d399", // Emerald 400
    "#a78bfa", // Violet 400
    "#fbbf24", // Amber 400
    "#f87171", // Rose 400
  ];

  const maxValue = top5.length > 0 ? top5[0].value : 1;

  return (
    <Card className="col-span-1 lg:col-span-3 border-border/50 bg-card flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-4">
            <CardTitle className="text-sm font-medium">Top Experts</CardTitle>
            
            {hasSalesData && (
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                    <Button 
                        variant={currentMetric === 'deposits' ? 'secondary' : 'ghost'} 
                        size="sm" 
                        className="h-7 text-xs px-2"
                        onClick={() => setMetric('deposits')}
                    >
                        Depósitos
                    </Button>
                    <Button 
                        variant={currentMetric === 'sales' ? 'secondary' : 'ghost'} 
                        size="sm" 
                        className="h-7 text-xs px-2"
                        onClick={() => setMetric('sales')}
                    >
                        Vendas Totais
                    </Button>
                </div>
            )}
        </div>
        <Trophy className="h-4 w-4 text-yellow-500" />
      </CardHeader>
      <CardContent className="pt-4 flex-1 flex flex-col">
        {/* Lista Top 5 */}
        <div className="space-y-4 mb-4">
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
                    {currentMetric === 'deposits' && (
                        <div className="flex items-center gap-1 text-muted-foreground text-xs" title="Média Score Grupo">
                            <TrendingUp className="h-3 w-3" />
                            <span>{expert.avgScore.toFixed(1)}</span>
                        </div>
                    )}
                    <div className="font-mono font-bold text-foreground">
                        R$ {expert.value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                </div>
              </div>

              <div className="relative h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ease-out ${rankingColors[idx] || "bg-gray-500"}`}
                  style={{ width: `${(expert.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Gráfico de Pizza com TODOS os experts */}
        {allExperts.length > 0 && (
            <div className="h-[500px] w-full mt-6 border-t border-border/50 pt-6">
               <p className="text-xs font-bold text-muted-foreground mb-4 text-center uppercase tracking-widest">
                   Share Total de {currentMetric === 'deposits' ? 'Depósitos' : 'Vendas'}
               </p>
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                   <Pie
                     data={allExperts}
                     cx="50%"
                     cy="45%"
                     labelLine={false}
                     outerRadius={160}
                     fill="#8884d8"
                     dataKey="value"
                     stroke="none"
                   >
                     {allExperts.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                     ))}
                   </Pie>
                   <Tooltip 
                     formatter={(value: any, name: any, props: any) => [
                       `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 
                       props.payload.name
                     ]}
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
              Sem dados no período.
            </div>
        )}
      </CardContent>
    </Card>
  );
}

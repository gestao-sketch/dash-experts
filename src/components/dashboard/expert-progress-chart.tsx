"use client";

import { useState, useMemo } from "react";
import { Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Bar, Line, ComposedChart, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Metrics } from "@/config/sheets";

interface ExpertProgressChartProps {
  data: Metrics[];
  title?: string;
  valuePrefix?: string;
}

type Granularity = 'daily' | 'weekly' | 'monthly';

export function ExpertProgressChart({ 
  data, 
  title = "Progresso do Expert", 
  valuePrefix = "R$ "
}: ExpertProgressChartProps) {
  const [granularity, setGranularity] = useState<Granularity>('daily');
  
  // Cores do Tema
  const depositsColor = "hsl(var(--chart-1))"; // Verde (Principal)
  const investmentColor = "hsl(var(--chart-2))"; // Roxo/Azul (Secundário)
  const revenueColor = "hsl(var(--chart-3))"; // Laranja/Dourado (Destaque)
  const trendColor = "hsl(var(--chart-4))"; // Rosa (Evolução)
  const axisColor = "hsl(var(--muted-foreground))";

  // Função para agrupar dados
  const chartData = useMemo(() => {
    // 1. Converter datas e ordenar
    const sortedData = [...data]
      .map(item => {
        const parts = item.date.split('/');
        return {
          ...item,
          parsedDate: new Date(`${parts[1]}/${parts[0]}/${parts[2]}`)
        };
      })
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

    if (sortedData.length === 0) return [];

    const grouped: Record<string, { count: number, dateObj: Date, investment: number, deposits: number, revenue: number }> = {};

    sortedData.forEach(item => {
        let key = "";
        const date = item.parsedDate;
        
        switch (granularity) {
            case 'daily':
                key = item.date.substring(0, 5); // DD/MM
                break;
            case 'weekly':
                const day = date.getDay();
                const diff = date.getDate() - day;
                const weekStart = new Date(date);
                weekStart.setDate(diff);
                key = `${String(weekStart.getDate()).padStart(2, '0')}/${String(weekStart.getMonth()+1).padStart(2, '0')}`;
                break;
            case 'monthly':
                const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
                key = `${monthNames[date.getMonth()]}/${date.getFullYear().toString().substring(2)}`;
                break;
        }

        if (!grouped[key]) {
            grouped[key] = { investment: 0, deposits: 0, revenue: 0, count: 0, dateObj: date };
        }
        
        // Agregar métricas
        grouped[key].investment += item.cost || 0;
        grouped[key].deposits += item.deposits || 0;
        grouped[key].revenue += item.revenue || 0;
        grouped[key].count += 1;
    });

    const result = Object.entries(grouped)
        .map(([key, data]) => ({
            date: key,
            investment: data.investment,
            deposits: data.deposits,
            revenue: data.revenue,
            originalDate: data.dateObj
        }))
        .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());

    // Calcular variação percentual baseada em Depósitos (fluxo imediato)
    return result.map((item, index) => {
        let percentChange = 0;
        if (index > 0) {
            const prevValue = result[index - 1].deposits;
            if (prevValue === 0) {
                percentChange = item.deposits > 0 ? 100 : 0;
            } else {
                percentChange = ((item.deposits - prevValue) / prevValue) * 100;
            }
        }
        return { ...item, percentChange };
    });
    
  }, [data, granularity]);

  return (
    <Card className="col-span-4 border-border/50 bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div className="flex flex-col gap-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>Acompanhamento de Investimento x Depósito x REV</CardDescription>
        </div>
        <div className="flex items-center bg-muted/50 p-1 rounded-lg">
            <Button 
                variant={granularity === 'daily' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="h-8 text-xs px-3"
                onClick={() => setGranularity('daily')}
            >
                Diário
            </Button>
            <Button 
                variant={granularity === 'weekly' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="h-8 text-xs px-3"
                onClick={() => setGranularity('weekly')}
            >
                Semanal
            </Button>
            <Button 
                variant={granularity === 'monthly' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="h-8 text-xs px-3"
                onClick={() => setGranularity('monthly')}
            >
                Mensal
            </Button>
        </div>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={depositsColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={depositsColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke={axisColor} 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                minTickGap={30}
              />
              <YAxis 
                yAxisId="left"
                stroke={axisColor} 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke={trendColor} 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `${value.toFixed(0)}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--popover))", 
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  color: "hsl(var(--popover-foreground))"
                }}
                formatter={(value: any, name: any) => {
                    if (name === "Evolução %" || name === "percentChange") return [`${Number(value).toFixed(1)}%`, "Evolução (Depósitos)"];
                    return [`${valuePrefix}${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, name];
                }}
                labelFormatter={(label) => `Período: ${label}`}
              />
              <Legend />
              
              {/* Investimento (Barra) - Base sólida */}
              <Bar 
                yAxisId="left"
                dataKey="investment" 
                name="Investimento"
                fill={investmentColor} 
                radius={[4, 4, 0, 0]}
                barSize={20}
              />

              {/* Depósitos (Área) - Contexto de Volume */}
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="deposits" 
                name="Depósitos"
                stroke={depositsColor} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorDeposits)" 
              />

              {/* REV (Linha) - Métrica Principal (com delay) */}
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                name="REV (Profit)"
                stroke={revenueColor} 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
                connectNulls
              />

              {/* Evolução (Linha Pontilhada) - Contexto de Tendência */}
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="percentChange" 
                name="Evolução %"
                stroke={trendColor} 
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 4" 
                activeDot={{ r: 4 }}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

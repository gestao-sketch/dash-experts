"use client";

import { useState, useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar, Line, ComposedChart, Legend } from "recharts";
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
  
  // Cor fixa para consistência
  const chartColor = "#10b981"; // Emerald-500

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

    const grouped: Record<string, { value: number, count: number, dateObj: Date }> = {};

    sortedData.forEach(item => {
        let key = "";
        const date = item.parsedDate;
        
        switch (granularity) {
            case 'daily':
                key = item.date.substring(0, 5); // DD/MM
                break;
            case 'weekly':
                // Obter início da semana (Domingo)
                const day = date.getDay();
                const diff = date.getDate() - day;
                const weekStart = new Date(date);
                weekStart.setDate(diff);
                key = `${String(weekStart.getDate()).padStart(2, '0')}/${String(weekStart.getMonth()+1).padStart(2, '0')}`;
                break;
            case 'monthly':
                // Mês/Ano
                const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
                key = `${monthNames[date.getMonth()]}/${date.getFullYear().toString().substring(2)}`;
                break;
        }

        if (!grouped[key]) {
            grouped[key] = { value: 0, count: 0, dateObj: date };
        }
        
        // Priorizar Valor Total se existir, senão Depósitos
        const val = (item.valor_total && item.valor_total > 0) ? item.valor_total : item.deposits;
        grouped[key].value += val;
        grouped[key].count += 1;
    });

    const result = Object.entries(grouped)
        .map(([key, data]) => ({
            date: key,
            value: data.value,
            originalDate: data.dateObj
        }))
        .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());

    // Calcular variação percentual
    return result.map((item, index) => {
        let percentChange = 0;
        if (index > 0) {
            const prevValue = result[index - 1].value;
            if (prevValue === 0) {
                // Se era 0 e agora é algo, tecnicamente é infinito, mas vamos limitar a 100% para visualização
                percentChange = item.value > 0 ? 100 : 0;
            } else {
                percentChange = ((item.value - prevValue) / prevValue) * 100;
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
            <CardDescription>Acompanhamento de performance temporal</CardDescription>
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
                <linearGradient id="colorValueProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                minTickGap={30}
              />
              <YAxis 
                yAxisId="left"
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${valuePrefix}${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#f59e0b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `${value.toFixed(0)}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(9, 9, 11, 0.9)", 
                  borderColor: "rgba(39, 39, 42, 0.5)",
                  borderRadius: "8px",
                  color: "#fafafa"
                }}
                formatter={(value: any, name: any) => {
                    if (name === "Evolução %" || name === "percentChange") return [`${Number(value).toFixed(1)}%`, "Evolução"];
                    return [`${valuePrefix}${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor'];
                }}
              />
              <Legend />
              {granularity === 'daily' ? (
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="value" 
                    name="Valor"
                    stroke={chartColor} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorValueProgress)" 
                  />
              ) : (
                  <Bar 
                    yAxisId="left"
                    dataKey="value" 
                    name="Valor"
                    fill={chartColor} 
                    radius={[4, 4, 0, 0]}
                  />
              )}
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="percentChange" 
                name="Evolução %"
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: "#f59e0b", strokeWidth: 2, stroke: "var(--background)" }}
                style={{ filter: "drop-shadow(0px 2px 4px rgba(245, 158, 11, 0.5))" }}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

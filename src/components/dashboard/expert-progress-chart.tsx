"use client";

import { useState, useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
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
        // Mas a métrica principal de progresso geralmente é Vendas Totais se disponível, ou Depósitos.
        // O usuário pediu "evolução das métricas das lives" -> pode ser vendas.
        // Vamos somar ambos para ter a opção, mas exibir o maior?
        // Vamos usar Depósitos como padrão pois é garantido, ou Valor Total se tiver.
        const val = (item.valor_total && item.valor_total > 0) ? item.valor_total : item.deposits;
        grouped[key].value += val;
        grouped[key].count += 1;
    });

    return Object.entries(grouped).map(([key, data]) => ({
        date: key,
        value: data.value,
        originalDate: data.dateObj
    })); // A ordem do object.entries não é garantida, mas geralmente segue inserção. Melhor reordenar se necessário.
    
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
            {granularity === 'daily' ? (
                <AreaChart data={chartData}>
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
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${valuePrefix}${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "rgba(9, 9, 11, 0.9)", 
                      borderColor: "rgba(39, 39, 42, 0.5)",
                      borderRadius: "8px",
                      color: "#fafafa"
                    }}
                    itemStyle={{ color: chartColor }}
                    formatter={(value: any) => [`${valuePrefix}${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={chartColor} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorValueProgress)" 
                  />
                </AreaChart>
            ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${valuePrefix}${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ 
                      backgroundColor: "rgba(9, 9, 11, 0.9)", 
                      borderColor: "rgba(39, 39, 42, 0.5)",
                      borderRadius: "8px",
                      color: "#fafafa"
                    }}
                    itemStyle={{ color: chartColor }}
                    formatter={(value: any) => [`${valuePrefix}${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                  />
                  <Bar 
                    dataKey="value" 
                    fill={chartColor} 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface OverviewChartProps {
  data: { date: string; value: number }[];
  title?: string;
  description?: string;
  color?: string; // Hex or CSS var name like "var(--chart-1)"
  valuePrefix?: string;
}

export function OverviewChart({ 
  data, 
  title = "Evolução de Receita", 
  description = "Últimos 30 dias",
  color = "var(--chart-1)",
  valuePrefix = "R$ "
}: OverviewChartProps) {
  
  return (
    <Card className="col-span-4 border-border/50 bg-card/95">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
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
                itemStyle={{ color: color }}
                formatter={(value: any) => [`${valuePrefix}${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

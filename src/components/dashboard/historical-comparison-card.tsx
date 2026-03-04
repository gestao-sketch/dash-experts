"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { Metrics } from "@/config/sheets";

interface HistoricalComparisonCardProps {
  data: Metrics[];
}

export function HistoricalComparisonCard({ data }: HistoricalComparisonCardProps) {
  const comparisonData = useMemo(() => {
    // Separa dados por ano
    const data2025 = data.filter(d => d.date.includes("/2025"));
    const data2026 = data.filter(d => d.date.includes("/2026"));

    // Se não tiver dados de 2025, não faz sentido mostrar o comparativo
    if (data2025.length === 0) return null;

    // Função auxiliar para somar e contar meses únicos
    const getStats = (dataset: Metrics[]) => {
      const months = new Set(dataset.map(d => d.date.substring(3, 10))); // MM/YYYY
      const monthsCount = months.size || 1; // Evita divisão por zero

      const totalInvest = dataset.reduce((acc, curr) => acc + (curr.cost || 0), 0);
      const totalDeposit = dataset.reduce((acc, curr) => acc + (curr.deposits || 0), 0);
      const totalRev = dataset.reduce((acc, curr) => acc + (curr.revenue || 0), 0);

      return {
        investAvg: totalInvest / monthsCount,
        depositAvg: totalDeposit / monthsCount,
        revAvg: totalRev / monthsCount
      };
    };

    const stats2025 = getStats(data2025);
    const stats2026 = getStats(data2026);

    return [
      {
        name: "Investimento (Média)",
        "2025": stats2025.investAvg,
        "2026": stats2026.investAvg,
      },
      {
        name: "Depósitos (Média)",
        "2025": stats2025.depositAvg,
        "2026": stats2026.depositAvg,
      },
      {
        name: "REV (Média)",
        "2025": stats2025.revAvg,
        "2026": stats2026.revAvg,
      }
    ];
  }, [data]);

  if (!comparisonData) return null;

  return (
    <Card className="col-span-4 lg:col-span-2 border-border/50 bg-card">
      <CardHeader>
        <CardTitle>Comparativo de Performance (Média Mensal)</CardTitle>
        <CardDescription>
          Comparando o ritmo de 2025 (Histórico) vs 2026 (Atual)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted/20" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={120} 
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  color: "hsl(var(--popover-foreground))"
                }}
                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, '']}
              />
              <Legend />
              <Bar dataKey="2025" name="2025 (Média)" fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} barSize={20} />
              <Bar dataKey="2026" name="2026 (Média)" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

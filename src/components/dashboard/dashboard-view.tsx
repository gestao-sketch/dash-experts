"use client";

import { useState, useMemo } from "react";
import { Metrics } from "@/config/sheets";
import { aggregateMetrics, getDailyEvolution, getBestDay, calculateForecast } from "@/lib/analytics";
import { MetricCard } from "./metric-card";
import { OverviewChart } from "./overview-chart";
import { BestDayCard } from "./best-day-card";
import { ForecastCard } from "./forecast-card";
import { DataTable } from "./data-table";
import { DailySummaryCard } from "./daily-summary-card";
import { LiveQualityCard } from "./live-quality-card";
import { ExpertsQualityCard } from "./experts-quality-card";
import { TopExpertsCard } from "./top-experts-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, MousePointer2, TrendingUp, Users, ShoppingCart, ArrowRightLeft } from "lucide-react";

export function DashboardView({ data, title }: { data: Metrics[], title: string }) {
  const [range, setRange] = useState("30d");

  const filteredData = useMemo(() => {
    const now = new Date();
    // Zerar horas para comparação correta
    now.setHours(0, 0, 0, 0);

    return data.filter(item => {
      // Parse DD/MM/YYYY
      const parts = item.date.split('/');
      if (parts.length !== 3) return false;
      const date = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`); // MM/DD/YYYY
      date.setHours(0, 0, 0, 0);

      switch (range) {
        case "today":
          return date.getTime() === now.getTime();
        
        case "yesterday":
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          return date.getTime() === yesterday.getTime();
        
        case "this_week": {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay()); // Domingo como inicio
          return date >= startOfWeek;
        }

        case "last_week": {
          const startOfLastWeek = new Date(now);
          startOfLastWeek.setDate(now.getDate() - now.getDay() - 7);
          const endOfLastWeek = new Date(startOfLastWeek);
          endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
          return date >= startOfLastWeek && date <= endOfLastWeek;
        }

        case "this_month": {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return date >= startOfMonth;
        }

        case "last_month": {
          const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
          return date >= startOfLastMonth && date <= endOfLastMonth;
        }

        case "this_year": {
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          return date >= startOfYear;
        }

        case "last_year": {
          const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
          const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31);
          return date >= startOfLastYear && date <= endOfLastYear;
        }

        case "30d": {
          const thirtyDaysAgo = new Date(now);
          thirtyDaysAgo.setDate(now.getDate() - 30);
          return date >= thirtyDaysAgo;
        }

        case "all":
        default:
          return true;
      }
    });
  }, [data, range]);

  const stats = aggregateMetrics(filteredData);
  const dailyData = getDailyEvolution(filteredData);
  const bestDay = getBestDay(dailyData, "deposits"); // Melhor dia baseado em depósitos
  const forecast = calculateForecast(dailyData, 7);
  const forecastTotal = forecast.reduce((acc, curr) => acc + curr.deposits, 0); // Forecast ainda usa revenue como base linear? Ajustar para deposits

  // Combine historical and forecast for chart
  const chartData = [
    ...dailyData.map(d => ({ date: d.date.substring(0, 5), value: d.deposits })), // Gráfico usa Depósitos
  ];

  const getRangeLabel = () => {
    switch(range) {
      case "today": return "Hoje";
      case "yesterday": return "Ontem";
      case "this_week": return "Esta Semana";
      case "last_week": return "Semana Passada";
      case "this_month": return "Este Mês";
      case "last_month": return "Mês Passado";
      case "this_year": return "Este Ano";
      case "last_year": return "Ano Passado";
      case "30d": return "Últimos 30 Dias";
      case "all": return "Todo o Período";
      default: return range;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
          <p className="text-muted-foreground">Acompanhamento de performance em tempo real.</p>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[180px] bg-card/50">
             <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="yesterday">Ontem</SelectItem>
            <SelectItem value="this_week">Esta Semana</SelectItem>
            <SelectItem value="last_week">Semana Passada</SelectItem>
            <SelectItem value="this_month">Este Mês</SelectItem>
            <SelectItem value="last_month">Mês Passado</SelectItem>
            <SelectItem value="this_year">Este Ano</SelectItem>
            <SelectItem value="last_year">Ano Passado</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="all">Todo o Período</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Grid - Linha 1 */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Investimento" 
          value={`R$ ${stats.cost.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`}
          icon={<DollarSign />}
          color="chart-5" 
          description="Total investido no período"
        />
        <MetricCard 
          title="Depósitos" 
          value={`R$ ${stats.deposits.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`}
          icon={<DollarSign />}
          color="chart-1" // Green
          description="Total depositado"
        />
        <MetricCard 
          title="FTDs (Vendas)" 
          value={stats.sales.toString()}
          icon={<ShoppingCart />}
          color="chart-2" // Purple
          description={`Custo por FTD: R$ ${stats.cpa.toFixed(2)}`}
        />
         <MetricCard 
          title="ROAS" 
          value={`${stats.roas.toFixed(2)}x`}
          icon={<TrendingUp />}
          color={stats.roas >= 1 ? "chart-1" : "chart-5"}
          description="Retorno sobre investimento"
          trend={stats.roas >= 1 ? "up" : "down"}
        />
      </div>

      {/* KPI Grid - Linha 2 (Novos Cards) */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Leads Totais" 
          value={stats.leads.toString()}
          icon={<Users />}
          color="chart-4" 
          description={`CPL: R$ ${stats.cpl.toFixed(2)}`}
        />
        <MetricCard 
          title="Taxa de Conv. (Lead → FTD)" 
          value={`${stats.conversion_lead_ftd.toFixed(2)}%`}
          icon={<ArrowRightLeft />}
          color="chart-2" 
          description="Leads que viraram FTDs"
        />
        <MetricCard 
          title="Ticket Médio (FTD)" 
          value={`R$ ${stats.ticket_medio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`}
          icon={<DollarSign />}
          color="chart-1" 
          description="Valor médio por 1ª venda"
        />
        <MetricCard 
          title="Revenue Share" 
          value={`R$ ${stats.revenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`}
          icon={<DollarSign />}
          color="chart-1"
          description="Receita Compartilhada"
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <div className="lg:col-span-5 space-y-4">
           {/* Gráfico de Evolução */}
           <OverviewChart 
             data={chartData} 
             title="Evolução de Depósitos" 
             description={getRangeLabel()}
             color="var(--chart-1)"
           />
           
           {/* Grid: Top Experts + Resumo Diário */}
           <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <TopExpertsCard data={filteredData} />
              <DailySummaryCard data={filteredData} />
           </div>
        </div>
        
        <div className="lg:col-span-2 space-y-4">
          {/* Mostra card de ExpertsQuality (Média Geral) se title for "Visão Geral", senão mostra LiveQuality (Diário) */}
          {title.includes("Visão Geral") ? (
             <ExpertsQualityCard data={filteredData} />
          ) : (
             <LiveQualityCard data={filteredData} />
          )}

          {bestDay && (
             <BestDayCard 
               date={bestDay.date}
               revenue={bestDay.deposits} // Melhor dia baseado em depósitos
               roas={bestDay.roas}
             />
          )}
          <ForecastCard 
            next7DaysRevenue={forecastTotal}
            trend={0} 
          />
        </div>
      </div>
      
      {/* Tabela de Conferência */}
      <DataTable data={filteredData} />
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { Metrics } from "@/config/sheets";
import { aggregateMetrics, getDailyEvolution } from "@/lib/analytics";
import { getDateRange, getPreviousDateRange } from "@/lib/utils";
import { MetricCard } from "./metric-card";
import { OverviewChart } from "./overview-chart";
import { DataTable } from "./data-table";
import { DailySummaryCard } from "./daily-summary-card";
import { LiveQualityCard } from "./live-quality-card";
import { ExpertsQualityCard } from "./experts-quality-card";
import { TopExpertsCard } from "./top-experts-card";
import { ExpertProgressChart } from "./expert-progress-chart";
import { ScalingOpportunitiesCard } from "./scaling-opportunities-card";
import { ExpertStatusBadge } from "./expert-status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { DateRange } from "react-day-picker";
import { DollarSign, TrendingUp, TrendingDown, Users, ShoppingCart, ArrowRightLeft } from "lucide-react";

export function DashboardView({ data, title }: { data: Metrics[], title: string }) {
  const [range, setRange] = useState("30d");
  const [customDate, setCustomDate] = useState<DateRange | undefined>(undefined);
  const isGeneralView = title.includes("Visão Geral");

  // 1. Gera um array de datas completo baseado no range selecionado
  const dateRange = useMemo(() => {
    const dates: string[] = [];
    
    // Lógica para intervalo personalizado
    if (range === "custom" && customDate?.from && customDate?.to) {
        const currentDate = new Date(customDate.from);
        const endDate = new Date(customDate.to);
        endDate.setHours(23, 59, 59, 999);

        while (currentDate <= endDate) {
            const day = String(currentDate.getDate()).padStart(2, '0');
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const year = currentDate.getFullYear();
            dates.push(`${day}/${month}/${year}`);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
    }

    const now = new Date();
    // Zerar horas
    now.setHours(0, 0, 0, 0);
    
    let startDate = new Date(now);
    let endDate = new Date(now);

    switch (range) {
      case "today":
        startDate = new Date(now);
        break;
      case "yesterday":
        startDate.setDate(now.getDate() - 1);
        endDate = new Date(startDate);
        break;
      case "this_week":
        startDate.setDate(now.getDate() - now.getDay());
        break;
      case "last_week":
        startDate.setDate(now.getDate() - now.getDay() - 7);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;
      case "this_month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "last_month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "this_year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "last_year":
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "custom":
        // Se for custom mas não tiver data definida, não faz nada (retorna vazio ou fallback)
        if (!customDate?.from || !customDate?.to) return [];
        // O loop já foi tratado no if acima para custom
        return dates;
      case "all":
      default:
        // Para "all", vamos pegar a data mais antiga dos dados reais ou 30 dias atrás como fallback
        if (data.length > 0) {
             const sortedDates = [...data].sort((a,b) => {
                 const parse = (d: string) => { const p = d.split('/'); return new Date(`${p[1]}/${p[0]}/${p[2]}`).getTime(); };
                 return parse(a.date) - parse(b.date);
             });
             const firstDateParts = sortedDates[0].date.split('/');
             startDate = new Date(`${firstDateParts[1]}/${firstDateParts[0]}/${firstDateParts[2]}`);
        } else {
             startDate.setDate(now.getDate() - 30);
        }
        break;
    }

    // Loop para preencher o array de datas
    const currentDate = new Date(startDate);
    // Ajuste para garantir que endDate inclua o próprio dia na comparação
    endDate.setHours(23, 59, 59, 999); 

    while (currentDate <= endDate) {
        // Formato DD/MM/YYYY
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const year = currentDate.getFullYear();
        dates.push(`${day}/${month}/${year}`);
        
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }, [range, data]);

  // 2. Filtra os dados existentes baseados no range (mantém lógica de KPIs)
  const filteredData = useMemo(() => {
    if (range === "custom") {
        if (!customDate?.from || !customDate?.to) return [];
        
        const startDate = new Date(customDate.from);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(customDate.to);
        endDate.setHours(23, 59, 59, 999);

        return data.filter(item => {
            const parts = item.date.split('/');
            if (parts.length !== 3) return false;
            const date = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
            date.setHours(0, 0, 0, 0);
            return date >= startDate && date <= endDate;
        });
    }

    const { startDate, endDate } = getDateRange(range);

    return data.filter(item => {
        const parts = item.date.split('/');
        if (parts.length !== 3) return false;
        const date = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
        date.setHours(0, 0, 0, 0);

        // O endDate já vem configurado corretamente do util
        return date >= startDate && date <= endDate;
    });
  }, [data, range]);

  // 3. Filtra dados do período anterior para comparação
  const previousFilteredData = useMemo(() => {
      // Para custom range, a comparação anterior é complexa (mesmo período antes?). 
      // Por simplicidade, vamos comparar com o mesmo período imediatamente anterior (Duração X dias).
      if (range === "custom" && customDate?.from && customDate?.to) {
          const duration = customDate.to.getTime() - customDate.from.getTime();
          const prevEndDate = new Date(customDate.from.getTime() - 86400000); // 1 dia antes do inicio
          const prevStartDate = new Date(prevEndDate.getTime() - duration);
          
          prevStartDate.setHours(0, 0, 0, 0);
          prevEndDate.setHours(23, 59, 59, 999);

          return data.filter(item => {
            const parts = item.date.split('/');
            if (parts.length !== 3) return false;
            const date = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
            date.setHours(0, 0, 0, 0);
            return date >= prevStartDate && date <= prevEndDate;
          });
      }

      const { startDate, endDate } = getPreviousDateRange(range);
      
      return data.filter(item => {
        const parts = item.date.split('/');
        if (parts.length !== 3) return false;
        const date = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
        date.setHours(0, 0, 0, 0);

        return date >= startDate && date <= endDate;
      });
  }, [data, range]);

  // 4. Gera dados do gráfico preenchendo buracos com 0
  const chartData = useMemo(() => {
    // Agrupa dados existentes por data para acesso rápido
    const dataByDate: Record<string, number> = {};
    filteredData.forEach(item => {
        if (!dataByDate[item.date]) dataByDate[item.date] = 0;
        dataByDate[item.date] += item.deposits;
    });

    // Mapeia o range completo de datas
    return dateRange.map(date => ({
        date: date.substring(0, 5), // DD/MM para exibição
        value: dataByDate[date] || 0 // Valor real ou 0
    }));
  }, [dateRange, filteredData]); // filteredData já depende de range e customDate

  const stats = aggregateMetrics(filteredData);
  const dailyData = getDailyEvolution(filteredData);

  // Cálculo de Evolução (Semanal e Mensal) - Baseado em dados TOTAIS (data)
  const evolutionStats = useMemo(() => {
    if (isGeneralView) return null;

    const now = new Date();
    now.setHours(23, 59, 59, 999);

    const getSumForRange = (daysAgoStart: number, daysAgoEnd: number) => {
        const start = new Date(now);
        start.setDate(now.getDate() - daysAgoStart);
        start.setHours(0, 0, 0, 0);

        const end = new Date(now);
        end.setDate(now.getDate() - daysAgoEnd);
        end.setHours(23, 59, 59, 999);

        return data.reduce((acc, item) => {
            const parts = item.date.split('/');
            // Validação simples de data
            if (parts.length !== 3) return acc;
            
            const itemDate = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
            
            if (itemDate >= start && itemDate <= end) {
                // Prioriza Valor Total (Vendas) se existir, senão Depósitos
                return acc + (item.valor_total || item.deposits || 0);
            }
            return acc;
        }, 0);
    };

    const last7d = getSumForRange(6, 0); // 7 dias (incluindo hoje)
    const prev7d = getSumForRange(13, 7); // 7 dias anteriores
    const weeklyGrowth = prev7d === 0 ? (last7d > 0 ? 100 : 0) : ((last7d - prev7d) / prev7d) * 100;

    const last30d = getSumForRange(29, 0); // 30 dias
    const prev30d = getSumForRange(59, 30); // 30 dias anteriores
    const monthlyGrowth = prev30d === 0 ? (last30d > 0 ? 100 : 0) : ((last30d - prev30d) / prev30d) * 100;

    return { weeklyGrowth, monthlyGrowth };
  }, [data, isGeneralView]);

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
      case "custom": 
        if (customDate?.from && customDate?.to) {
            return `${customDate.from.toLocaleDateString('pt-BR')} - ${customDate.to.toLocaleDateString('pt-BR')}`;
        }
        return "Período Personalizado";
      case "all": return "Todo o Período";
      default: return range;
    }
  };

  // Helper para pegar status atual (última data válida GLOBAL, independente do filtro)
  const currentStatus = useMemo(() => {
    // Se for geral, não faz sentido calcular um único status
    if (isGeneralView) return { classificacao: "N/A", tendencia: "N/A" };

    // Usamos 'data' (todos os dados) em vez de 'filteredData' para pegar o status mais recente real
    // Isso garante que o badge reflita o estado atual do expert, mesmo olhando métricas antigas
    const sorted = [...data].sort((a, b) => {
        const parse = (d: string) => { const p = d.split('/'); return new Date(`${p[1]}/${p[0]}/${p[2]}`).getTime(); };
        return parse(b.date) - parse(a.date);
    });
    
    // Encontrar primeiro com classificação não vazia (o mais recente de todos)
    const latest = sorted.find(item => item.classificacao && item.classificacao.length > 0);
    
    return {
        classificacao: latest?.classificacao || "N/A",
        tendencia: latest?.tendencia || "N/A"
    };
  }, [data, isGeneralView]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 md:pb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            {/* Badge de Status na Página do Expert */}
            {!isGeneralView && (
                <ExpertStatusBadge 
                    classificacao={currentStatus.classificacao} 
                    tendencia={currentStatus.tendencia} 
                />
            )}
          </div>
          <p className="text-muted-foreground">Acompanhamento de performance em tempo real.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
            {range === "custom" && (
                <DatePickerWithRange 
                    date={customDate} 
                    setDate={setCustomDate} 
                />
            )}
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
                <SelectItem value="custom">Personalizado</SelectItem>
                <SelectItem value="all">Todo o Período</SelectItem>
              </SelectContent>
            </Select>
        </div>
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

        {/* Métrica de Faturamento Total (Dinâmica da Planilha) */}
        {stats.valor_total > 0 && (
             <MetricCard 
              title="Vendas Totais" 
              value={`R$ ${stats.valor_total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`}
              icon={<DollarSign />}
              color="chart-3" 
              description={isGeneralView ? "Soma Total de Vendas" : "Valor Total de Vendas"}
            />
        )}

        <MetricCard 
          title="Depósitos" 
          value={`R$ ${stats.deposits.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`}
          icon={<DollarSign />}
          color="chart-1" // Green
          description="Total depositado"
        />
        <MetricCard 
          title="FTDs (1º Depósito)" 
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

      {/* KPI Grid - Linha 2 */}
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
          description="Valor médio por 1º Depósito"
        />
        <MetricCard 
          title="Revenue Share" 
          value={`R$ ${stats.revenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`}
          icon={<DollarSign />}
          color="chart-1"
          description="Receita Compartilhada"
        />
      </div>

      {/* Layout Vertical Principal */}
      <div className="flex flex-col gap-6">
          
        {/* 0. Card de Oportunidades de Escala (Apenas Visão Geral) */}
        {isGeneralView && <ScalingOpportunitiesCard data={filteredData} />}

        {/* 1. Qualidade e Performance (Horizontal) */}
        {isGeneralView ? (
            <ExpertsQualityCard data={filteredData} previousData={previousFilteredData} />
        ) : (
            <LiveQualityCard data={filteredData} />
        )}

        {/* 2. Gráfico de Evolução (Expert ou Geral) */}
        {isGeneralView ? (
             <OverviewChart 
              data={chartData} 
              title="Evolução de Depósitos" 
              description={getRangeLabel()}
              color="var(--chart-1)"
            />
        ) : (
            <ExpertProgressChart data={filteredData} title={`Progresso: ${title.replace("Dashboard - ", "")}`} />
        )}

        {/* 3. Top Experts - Apenas na visão geral */}
        {isGeneralView && <TopExpertsCard data={filteredData} />}
        
        {/* 4. Diário de Bordo */}
        <DailySummaryCard data={filteredData} />
      </div>
      
      {/* Tabela de Conferência */}
      <DataTable data={filteredData} />
    </div>
  );
}

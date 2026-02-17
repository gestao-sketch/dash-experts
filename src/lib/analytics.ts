import { Metrics } from "@/config/sheets";

export type AggregatedMetrics = {
  impressions: number;
  clicks: number;
  cost: number;
  leads: number;
  sales: number;
  revenue: number;
  deposits: number;
  valor_total: number; // Nova métrica de vendas
  
  leads_entrada: number;
  leads_saida: number;

  roas: number;
  ctr: number;
  cpc: number;
  cpl: number;
  cpa: number; 
  conversion_lead_ftd: number; // Taxa de Conversão Lead -> FTD (%)
  ticket_medio: number; // Ticket Médio (Depósitos / FTDs)
};

export function aggregateMetrics(data: Metrics[]): AggregatedMetrics {
  const total = data.reduce(
    (acc, curr) => ({
      impressions: acc.impressions + curr.impressions,
      clicks: acc.clicks + curr.clicks,
      cost: acc.cost + curr.cost,
      leads: acc.leads + curr.leads,
      sales: acc.sales + curr.sales,
      revenue: acc.revenue + curr.revenue,
      deposits: acc.deposits + curr.deposits,
      valor_total: (acc.valor_total || 0) + (curr.valor_total || 0), // Soma segura
      leads_entrada: acc.leads_entrada + curr.leads_entrada,
      leads_saida: acc.leads_saida + curr.leads_saida,
    }),
    { impressions: 0, clicks: 0, cost: 0, leads: 0, sales: 0, revenue: 0, deposits: 0, valor_total: 0, leads_entrada: 0, leads_saida: 0 }
  );

  return {
    ...total,
    roas: total.cost > 0 ? total.revenue / total.cost : 0, 
    ctr: total.impressions > 0 ? (total.clicks / total.impressions) * 100 : 0,
    cpc: total.clicks > 0 ? total.cost / total.clicks : 0,
    cpl: total.leads > 0 ? total.cost / total.leads : 0,
    cpa: total.sales > 0 ? total.cost / total.sales : 0,
    conversion_lead_ftd: total.leads > 0 ? (total.sales / total.leads) * 100 : 0,
    ticket_medio: total.sales > 0 ? total.deposits / total.sales : 0,
  };
}

export function groupDataByDate(data: Metrics[]): Record<string, Metrics[]> {
  return data.reduce((acc, curr) => {
    const date = curr.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(curr);
    return acc;
  }, {} as Record<string, Metrics[]>);
}

export function getDailyEvolution(data: Metrics[]) {
  const grouped = groupDataByDate(data);
  const sortedDates = Object.keys(grouped).sort((a, b) => {
    return new Date(parseDateString(a)).getTime() - new Date(parseDateString(b)).getTime();
  });

  return sortedDates.map(date => {
    const dayMetrics = aggregateMetrics(grouped[date]);
    return {
      date,
      ...dayMetrics
    };
  });
}

export function getBestDay(dailyData: ReturnType<typeof getDailyEvolution>, metric: keyof AggregatedMetrics = 'revenue') {
  if (dailyData.length === 0) return null;
  
  return dailyData.reduce((prev, current) => {
    return (prev[metric] > current[metric]) ? prev : current;
  });
}

export function calculateForecast(dailyData: ReturnType<typeof getDailyEvolution>, daysToForecast: number = 7) {
  if (dailyData.length < 2) return [];

  // Simple Linear Regression on last 30 days
  const recentData = dailyData.slice(-30);
  const n = recentData.length;
  
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  
  recentData.forEach((point, i) => {
    const x = i;
    const y = point.deposits; // Usar depósitos para projeção
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const lastDate = new Date(parseDateString(recentData[recentData.length - 1].date));
  const forecast = [];

  for (let i = 1; i <= daysToForecast; i++) {
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + i);
    
    // x value continues from where we left off
    const x = n - 1 + i;
    const projectedValue = slope * x + intercept;

    forecast.push({
      date: nextDate.toLocaleDateString('pt-BR'),
      revenue: Math.max(0, projectedValue), // No negative revenue (usando 'revenue' apenas como chave genérica de valor)
      deposits: Math.max(0, projectedValue), // Adicionando deposits explicitamente
      isForecast: true
    });
  }

  return forecast;
}

export function parseDateString(dateStr: string): string {
  // Try to handle DD/MM/YYYY
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      // Assume DD/MM/YYYY -> MM/DD/YYYY for JS Date constructor
      return `${parts[1]}/${parts[0]}/${parts[2]}`;
    }
  }
  return dateStr;
}

// --- Novas Funções de Classificação e Evolução ---

export type ExpertStatus = {
  classificacao: string;
  tendencia: string;
  lastUpdate: string;
};

export type EvolutionStats = {
  weeklyGrowth: number;
  monthlyGrowth: number;
};

export function calculateExpertStatus(data: Metrics[]): ExpertStatus {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    
    // Define intervalo dos últimos 7 dias
    const startLast7d = new Date(now);
    startLast7d.setDate(now.getDate() - 6); // Hoje + 6 anteriores = 7 dias
    startLast7d.setHours(0, 0, 0, 0);

    // Define intervalo dos 7 dias anteriores (para tendência)
    const startPrev7d = new Date(startLast7d);
    startPrev7d.setDate(startLast7d.getDate() - 7);
    const endPrev7d = new Date(startLast7d);
    endPrev7d.setDate(startLast7d.getDate() - 1);
    endPrev7d.setHours(23, 59, 59, 999);

    const filterByDate = (start: Date, end: Date) => {
        return data.filter(item => {
            const parts = item.date.split('/');
            const itemDate = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
            return itemDate >= start && itemDate <= end;
        });
    };

    const last7dData = filterByDate(startLast7d, now);
    const prev7dData = filterByDate(startPrev7d, endPrev7d);

    // Agrega métricas
    const sumMetrics = (dataset: Metrics[]) => {
        return dataset.reduce((acc, item) => ({
            cost: acc.cost + item.cost,
            return: acc.return + (item.valor_total || item.deposits || 0) // Prioriza Vendas (Valor Total), senão Depósitos
        }), { cost: 0, return: 0 });
    };

    const currentMetrics = sumMetrics(last7dData);
    const prevMetrics = sumMetrics(prev7dData);

    // --- Lógica de Classificação (ROAS) ---
    // ROAS = Retorno / Custo
    // >= 1.5 -> ESCALAR
    // 1.0 a 1.49 -> MANTER
    // < 1.0 -> EM RISCO
    let classificacao = "EM RISCO";
    const roas = currentMetrics.cost > 0 ? currentMetrics.return / currentMetrics.cost : 0;

    if (last7dData.length === 0) {
        classificacao = "SEM DADOS";
    } else if (roas >= 1.5) {
        classificacao = "ESCALAR";
    } else if (roas >= 1.0) {
        classificacao = "MANTER";
    }

    // --- Lógica de Tendência (Crescimento de Retorno) ---
    // > +10% -> SUBINDO
    // < -10% -> DESCENDO
    // Entre -10% e +10% -> ESTÁVEL
    let tendencia = "ESTÁVEL";
    
    // Se não teve retorno no período anterior
    if (prevMetrics.return === 0) {
        if (currentMetrics.return > 0) tendencia = "SUBINDO"; // Saiu do zero
        // Se ambos forem zero, mantém estável
    } else {
        const growth = ((currentMetrics.return - prevMetrics.return) / prevMetrics.return) * 100;
        if (growth > 10) tendencia = "SUBINDO";
        else if (growth < -10) tendencia = "DESCENDO";
    }

    return {
        classificacao,
        tendencia,
        lastUpdate: now.toLocaleDateString('pt-BR')
    };
}

export function calculateEvolutionStats(data: Metrics[]): EvolutionStats {
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
            if (parts.length !== 3) return acc;
            
            const itemDate = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
            
            if (itemDate >= start && itemDate <= end) {
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
}

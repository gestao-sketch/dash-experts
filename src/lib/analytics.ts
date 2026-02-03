import { Metrics } from "@/config/sheets";

export type AggregatedMetrics = {
  impressions: number;
  clicks: number;
  cost: number;
  leads: number;
  sales: number;
  revenue: number;
  deposits: number;
  
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
      leads_entrada: acc.leads_entrada + curr.leads_entrada,
      leads_saida: acc.leads_saida + curr.leads_saida,
    }),
    { impressions: 0, clicks: 0, cost: 0, leads: 0, sales: 0, revenue: 0, deposits: 0, leads_entrada: 0, leads_saida: 0 }
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

function parseDateString(dateStr: string): string {
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

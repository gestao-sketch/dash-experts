import { Metrics } from "./sheets";

// Interface simplificada para entrada manual
interface MonthlyData {
  month: number; // 9 = Setembro
  year: number;  // 2025
  investment: number;
  deposits: number;
  revenue: number; // REV
}

// Mapa de Slug do cliente -> Dados Históricos
const HISTORICAL_ENTRIES: Record<string, MonthlyData[]> = {
  "allan": [
    { month: 9, year: 2025, investment: 4703.39, deposits: 230045.73, revenue: 3139.10 }, // Infoproduto assumido como REV
    { month: 10, year: 2025, investment: 110964.31, deposits: 495115.72, revenue: 29624.10 },
    { month: 11, year: 2025, investment: 79322.30, deposits: 450602.88, revenue: 36883.40 },
    { month: 12, year: 2025, investment: 123172.16, deposits: 665412.85, revenue: 36763.70 },
  ],
  "sheik": [
    { month: 9, year: 2025, investment: 0.00, deposits: 0.00, revenue: 0.00 },
    { month: 10, year: 2025, investment: 0.00, deposits: 0.00, revenue: 0.00 },
    { month: 11, year: 2025, investment: 0.00, deposits: 0.00, revenue: 0.00 },
    { month: 12, year: 2025, investment: 4362.00, deposits: 12132.96, revenue: 290.52 },
  ],
  // Adicione os outros aqui conforme o usuário enviar
};

// Função auxiliar para converter esses dados no formato Metrics
export function getHistoricalData(slug: string): Metrics[] {
  const entries = HISTORICAL_ENTRIES[slug];
  if (!entries) return [];

  return entries.map(entry => {
    // Cria uma data fictícia no último dia do mês para garantir que entre no mês correto
    // mês no JS é 0-indexado (0 = Jan, 8 = Set)
    const date = new Date(entry.year, entry.month - 1, 28); 
    const dateStr = date.toLocaleDateString('pt-BR');

    return {
      date: dateStr,
      clientName: slug, // Simplificado
      cost: entry.investment,
      deposits: entry.deposits,
      revenue: entry.revenue,
      sales: 0, // FTDs não informados no histórico
      leads: 0,
      leads_entrada: 0,
      leads_saida: 0,
      impressions: 0,
      clicks: 0,
      grupo_score: 0,
      live_assistida: "N/A",
      pico_live: 0,
      final_live: 0,
      score_live_total: 0,
      iee_indice: 0,
      roas: entry.investment > 0 ? entry.revenue / entry.investment : 0,
      platform: "Histórico",
      campaign: "Histórico 2025",
      valor_total: entry.deposits // Assumindo valor total ~ depósitos se não houver venda informada? Ou 0?
    } as Metrics;
  });
}

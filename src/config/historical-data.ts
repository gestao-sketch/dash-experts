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
    { month: 9, year: 2025, investment: 4703.39, deposits: 230045.73, revenue: 0 }, 
    { month: 10, year: 2025, investment: 110964.31, deposits: 495115.72, revenue: 0 },
    { month: 11, year: 2025, investment: 79322.30, deposits: 450602.88, revenue: 0 },
    { month: 12, year: 2025, investment: 123172.16, deposits: 665412.85, revenue: 0 },
  ],
  "sheik": [
    { month: 9, year: 2025, investment: 0.00, deposits: 0.00, revenue: 0.00 },
    { month: 10, year: 2025, investment: 0.00, deposits: 0.00, revenue: 0.00 },
    { month: 11, year: 2025, investment: 0.00, deposits: 0.00, revenue: 0.00 },
    { month: 12, year: 2025, investment: 4362.00, deposits: 12132.96, revenue: 290.52 },
  ],
  "mineirinho-bet": [
    { month: 9, year: 2025, investment: 6908.37, deposits: 981034.59, revenue: 75701.40 },
    { month: 10, year: 2025, investment: 29690.73, deposits: 1177851.21, revenue: 38675.29 },
    { month: 11, year: 2025, investment: 16447.35, deposits: 714583.90, revenue: 36.79 },
    { month: 12, year: 2025, investment: 16088.46, deposits: 594065.24, revenue: -371.18 },
  ],
  "caio": [
    { month: 9, year: 2025, investment: 7740.83, deposits: 36516.90, revenue: 7246.82 },
    { month: 10, year: 2025, investment: 21377.26, deposits: 52757.88, revenue: 7305.13 },
    { month: 11, year: 2025, investment: 6679.94, deposits: 16670.40, revenue: 1043.11 },
    { month: 12, year: 2025, investment: 15017.36, deposits: 78576.81, revenue: 8780.44 },
  ],
  "thon": [
    { month: 9, year: 2025, investment: 0.00, deposits: 0.00, revenue: 0.00 },
    { month: 10, year: 2025, investment: 0.00, deposits: 0.00, revenue: 0.00 },
    { month: 11, year: 2025, investment: 0.00, deposits: 0.00, revenue: 0.00 },
    { month: 12, year: 2025, investment: 0.00, deposits: 24955.59, revenue: 5248.53 },
  ],
  "diego-higoshi": [
    { month: 9, year: 2025, investment: 0.00, deposits: 17813.87, revenue: 2931.34 },
    { month: 10, year: 2025, investment: 0.00, deposits: 3212.92, revenue: 0.00 },
    { month: 11, year: 2025, investment: 1085.03, deposits: 574.08, revenue: 67.84 },
    { month: 12, year: 2025, investment: 10194.39, deposits: 45130.78, revenue: 16809.89 },
  ],
  "will-paizao": [
    { month: 9, year: 2025, investment: 11738.47, deposits: 57811.24, revenue: 9237.06 },
    { month: 10, year: 2025, investment: 21136.48, deposits: 35255.96, revenue: 4167.16 },
    { month: 11, year: 2025, investment: 7852.11, deposits: 23726.84, revenue: 1510.00 },
    { month: 12, year: 2025, investment: 10179.52, deposits: 27300.37, revenue: 565.03 },
  ],
  "will-paiz-o": [ // Alias para garantir
    { month: 9, year: 2025, investment: 11738.47, deposits: 57811.24, revenue: 9237.06 },
    { month: 10, year: 2025, investment: 21136.48, deposits: 35255.96, revenue: 4167.16 },
    { month: 11, year: 2025, investment: 7852.11, deposits: 23726.84, revenue: 1510.00 },
    { month: 12, year: 2025, investment: 10179.52, deposits: 27300.37, revenue: 565.03 },
  ],
  "suzana": [
    { month: 9, year: 2025, investment: 13889.77, deposits: 290921.22, revenue: 15885.28 },
    { month: 10, year: 2025, investment: 42915.85, deposits: 264429.56, revenue: 24884.57 },
    { month: 11, year: 2025, investment: 11271.45, deposits: 112384.64, revenue: 3624.45 },
    { month: 12, year: 2025, investment: 16462.79, deposits: 51627.57, revenue: 844.39 },
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

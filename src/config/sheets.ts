// Configurações estáticas (se houver) e tipos
// A lista de CLIENTS agora é dinâmica e vem do google-sheets.ts

export const SPREADSHEET_ID = "1DKj435qnScUQHtgt5GQt7hYnWNg45yt4uFDAGVenSGU";

export interface ClientConfig {
  name: string;
  gid: string;
  slug: string;
}

export const CLIENTS: ClientConfig[] = []; 

// Mapeamento COMPLETO das colunas (Base 0: A=0, B=1, etc.)
export const COLUMN_MAPPING = {
  date: 0,        
  cost: 1,        
  deposits: 2,    
  ftds: 3,        
  leads: 4,       
  leads_entrada: 5, 
  leads_saida: 6,   
  
  // Scores
  grupo_score: 7,       
  live_assistida: 8,    
  pico_live: 9,         
  final_live: 10,       
  retencao_score: 11,   
  cta_score: 12,        
  autoridade_score: 13, 
  emocional_score: 14,  
  estrutura_score: 15,  
  score_live_total: 16, 
  
  execucao_score: 17,   
  autodidata_score: 18, 
  infoproduto_score: 19, 
  iee_indice: 20,       
  
  resumo_80_20: 21, 
  detalhado: 22,    
  revenue: 23,      
  
  impressions: -1, 
  clicks: -1, 
  roas: -1,     
  platform: -1, 
  campaign: -1, 
};

export type Metrics = {
  // Identificação
  clientName?: string; // Novo campo opcional para agregação

  date: string;
  cost: number;
  leads: number; 
  sales: number; // FTDs
  revenue: number; 
  deposits: number;
  leads_entrada: number;
  leads_saida: number;
  
  // Novas Métricas
  grupo_score: number;
  live_assistida: string;
  pico_live: number;
  final_live: number;
  score_live_total: number;
  iee_indice: number;
  
  roas: number;
  
  // Campos de texto
  resumo_80_20?: string;
  detalhado?: string;
  
  // Compatibilidade
  impressions: number;
  clicks: number;
  platform: string;
  campaign: string;
};

import { slugify } from "@/lib/utils";
import { COLUMN_MAPPING, Metrics, ClientConfig } from "@/config/sheets";

// Cache simples em memória
let clientsCache: ClientConfig[] | null = null;

export async function fetchClients(): Promise<ClientConfig[]> {
  if (!process.env.APPS_SCRIPT_URL) return [];

  const url = `${process.env.APPS_SCRIPT_URL}?action=list_clients&token=${process.env.API_TOKEN}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 300 },
    });

    if (!response.ok) return [];

    const data = await response.json();
    
    if (Array.isArray(data)) {
      // Filtra abas indesejadas que não são clientes
      const ignoredTabs = [
        "Critérios Scorecard", 
        "Dashboard", 
        "Resumo", 
        "Geral", 
        "Config", 
        "Instruções",
        "Página1",
        "Sheet1"
      ];

      return data
        .filter((item: any) => !ignoredTabs.includes(item.name)) // Filtro aplicado
        .map((item: any) => ({
          name: item.name,
          gid: item.gid,
          slug: slugify(item.name),
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching clients list:", error);
    return [];
  }
}

export async function fetchClientData(slug: string): Promise<Metrics[]> {
  const clients = await fetchClients();
  const client = clients.find((c) => c.slug === slug);
  
  if (!client) {
    if (slug === 'cliente-exemplo') return [];
    return [];
  }

  return fetchSheetData(client.gid);
}

export async function fetchAllClientsData(): Promise<Record<string, Metrics[]>> {
  const clients = await fetchClients();
  const allData: Record<string, Metrics[]> = {};
  
  await Promise.all(
    clients.map(async (client) => {
      const data = await fetchSheetData(client.gid);
      // Injeta o nome do cliente nos dados
      const enrichedData = data.map(d => ({ ...d, clientName: client.name }));
      allData[client.slug] = enrichedData;
    })
  );

  return allData;
}

async function fetchSheetData(gid: string): Promise<Metrics[]> {
  if (!process.env.APPS_SCRIPT_URL) return [];

  const url = `${process.env.APPS_SCRIPT_URL}?gid=${gid}&token=${process.env.API_TOKEN}`;

  try {
    const response = await fetch(url, { next: { revalidate: 300 } });

    if (!response.ok) return [];

    const data = await response.json();

    if (!Array.isArray(data)) return [];

    // O usuário informou que os dados começam na linha 5.
    // Arrays são base 0, então linha 1 = index 0. Linha 5 = index 4.
    // Vamos pegar do index 4 para frente.
    
    // Tentativa de encontrar colunas dinâmicas no cabeçalho (linha 4 = index 3)
    let valorTotalIndex = -1;
    let classificacaoIndex = -1;
    let tendenciaIndex = -1;

    if (data.length > 3) {
        const headerRow = data[3];
        if (Array.isArray(headerRow)) {
            const getIndex = (term: string) => headerRow.findIndex((col: any) => 
                String(col).toUpperCase().trim().includes(term.toUpperCase())
            );

            valorTotalIndex = getIndex("VALOR TOTAL");
            classificacaoIndex = getIndex("CLASSIFICAÇÃO") > -1 ? getIndex("CLASSIFICAÇÃO") : getIndex("CLASSIFICACAO");
            tendenciaIndex = getIndex("TENDÊNCIA") > -1 ? getIndex("TENDÊNCIA") : getIndex("TENDENCIA");
        }
    }

    const rows = data.slice(4); 
    
    if (rows.length === 0) return [];

    const result: (Metrics | null)[] = rows.map((row: any[]) => {
      // Proteção contra linhas vazias ou incompletas
      if (!row || row.length === 0) return null;

      // Se a coluna de data estiver vazia, ignoramos
      const dateVal = row[COLUMN_MAPPING.date];
      if (!dateVal && dateVal !== 0) return null;

      const dateStr = parseDate(dateVal);
      if (!dateStr || dateStr === "Invalid Date") return null;

      const cost = parseNumber(row[COLUMN_MAPPING.cost]);
      const revenue = parseNumber(row[COLUMN_MAPPING.revenue]);
      const valorTotal = valorTotalIndex > -1 ? parseNumber(row[valorTotalIndex]) : 0;
      
      const classificacao = classificacaoIndex > -1 ? String(row[classificacaoIndex]).trim().toUpperCase() : "";
      const tendencia = tendenciaIndex > -1 ? String(row[tendenciaIndex]).trim().toUpperCase() : "";

      // Debug agressivo de DATA e SCORES (Apenas para as primeiras 3 linhas para não floodar)
      if (Math.random() < 0.1) {
         // console.log(`[DEBUG] Row Raw:`, JSON.stringify(row.slice(0, 10))); // Mostra as primeiras 10 colunas
         // console.log(`[DEBUG] Date Col[0]: "${row[0]}", Parsed: "${dateStr}"`);
         // console.log(`[DEBUG] Score Col[7]: "${row[7]}", Live Col[8]: "${row[8]}"`);
      }

      return {
        clientName: "Unknown", // Será preenchido no fetchAllClientsData
        date: dateStr,
        impressions: 0,
        clicks: 0,
        cost: cost,
        leads: parseNumber(row[COLUMN_MAPPING.leads]),
        sales: parseNumber(row[COLUMN_MAPPING.ftds]), // Mapeando FTDs explicitamente aqui
        revenue: revenue,
        deposits: parseNumber(row[COLUMN_MAPPING.deposits]),
        leads_entrada: parseNumber(row[COLUMN_MAPPING.leads_entrada]),
        leads_saida: parseNumber(row[COLUMN_MAPPING.leads_saida]),
        
        // Novas Métricas Mapeadas
        grupo_score: parseNumber(row[COLUMN_MAPPING.grupo_score]),
        live_assistida: row[COLUMN_MAPPING.live_assistida] ? String(row[COLUMN_MAPPING.live_assistida]) : "NÃO",
        pico_live: parseNumber(row[COLUMN_MAPPING.pico_live]),
        final_live: parseNumber(row[COLUMN_MAPPING.final_live]),
        score_live_total: parseNumber(row[COLUMN_MAPPING.score_live_total]),
        iee_indice: parseNumber(row[COLUMN_MAPPING.iee_indice]),
        
        roas: cost > 0 ? revenue / cost : 0,
        platform: "Geral",
        campaign: "Geral",
        
        // Mapear campos de texto
        resumo_80_20: row[COLUMN_MAPPING.resumo_80_20] ? String(row[COLUMN_MAPPING.resumo_80_20]) : "",
        detalhado: row[COLUMN_MAPPING.detalhado] ? String(row[COLUMN_MAPPING.detalhado]) : "",
        
        valor_total: valorTotal,
        classificacao: classificacao,
        tendencia: tendencia,
      };
    });

    return result.filter((item): item is Metrics => item !== null);

  } catch (error) {
    console.error(`Error fetching data for GID ${gid}:`, error);
    return [];
  }
}

function parseNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  const str = String(value).trim();
  
  // Se for vazio ou traço
  if (str === '-' || str === '') return 0;

  // Remove R$, %, espaços
  let clean = str.replace(/[R$\s%]/g, "");
  
  // Lógica para detecção de formato BR vs US
  // Se tiver vírgula e ponto (ex: 1.200,50), remove ponto e troca vírgula
  if (clean.includes('.') && clean.includes(',')) {
     clean = clean.replace(/\./g, "").replace(",", ".");
  } 
  // Se tiver só vírgula (ex: 1200,50), troca por ponto
  else if (clean.includes(',')) {
    clean = clean.replace(",", ".");
  }
  // Se tiver só ponto, assumimos que se for 1.200 é milhar (1200), se for 1.2 é decimal?
  // No contexto de planilhas BR, ponto geralmente é milhar ou visual. 
  // Mas cuidado: em JS '1.5' é um e meio. 
  // Vamos assumir que se veio do Sheets via JSON e é string, o Sheets geralmente manda o formato de exibição.
  // Se for "1.200", removemos o ponto.
  else if (clean.split('.').length > 1 && clean.split('.')[1].length === 3) {
     // Heurística fraca, mas comum: se tem ponto e 3 digitos depois, é milhar
     clean = clean.replace(/\./g, "");
  }

  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

function parseDate(value: any): string {
  if (!value) return "";
  
  // Se vier como número serial do Excel/Sheets (ex: 45321)
  if (typeof value === 'number') {
    // Excel base date é 30/12/1899
    // Cuidado com timezone. Adicionamos horas para cair no meio do dia e evitar virada errada
    const sheetsEpoch = new Date(1899, 11, 30);
    const date = new Date(sheetsEpoch.getTime() + value * 24 * 60 * 60 * 1000);
    
    // Verificação de sanidade: Se a data for muito no futuro (> ano atual + 1), pode ser erro de parser
    // Mas vamos confiar na matemática primeiro.
    // Ajuste de fuso: forçar UTC ou adicionar horas
    date.setHours(12, 0, 0, 0); 
    
    return date.toLocaleDateString('pt-BR');
  }

  const str = String(value).trim();
  if (!str) return "";

  // Se já for DD/MM/YYYY (Padrão BR)
  if (str.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    return str;
  }

  // Tenta converter ISO ou outros formatos
  const date = new Date(str);
  if (!isNaN(date.getTime())) {
    // Corrige possível problema de timezone que joga pro dia anterior
    // Se a data vier como "2024-02-01", o new Date assume UTC 00:00. No Brasil (GMT-3) vira dia anterior 21:00.
    // Adicionamos o offset do timezone para corrigir
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const correctedDate = new Date(date.getTime() + userTimezoneOffset + (12 * 3600000)); // +12h segurança
    return correctedDate.toLocaleDateString('pt-BR');
  }

  return "";
}

import { fetchAllClientsData } from "@/lib/google-sheets";
import { NextResponse } from "next/server";

export const revalidate = 300; // Cache de 5 minutos

export async function GET() {
  try {
    const allDataMap = await fetchAllClientsData();
    const statusMap: Record<string, { classificacao: string; tendencia: string }> = {};

    Object.entries(allDataMap).forEach(([slug, metrics]) => {
      // Ordenar por data decrescente para pegar o último
      const sorted = [...metrics].sort((a, b) => {
        const parse = (d: string) => { 
            if (!d) return 0;
            const p = d.split('/'); 
            return new Date(`${p[1]}/${p[0]}/${p[2]}`).getTime(); 
        };
        return parse(b.date) - parse(a.date);
      });

      // Encontrar primeiro com classificação preenchida
      const latest = sorted.find(item => item.classificacao && item.classificacao.length > 0);

      statusMap[slug] = {
        classificacao: latest?.classificacao || "N/A",
        tendencia: latest?.tendencia || "N/A"
      };
    });

    return NextResponse.json(statusMap);
  } catch (error) {
    console.error("Error fetching clients status:", error);
    return NextResponse.json({}, { status: 500 });
  }
}

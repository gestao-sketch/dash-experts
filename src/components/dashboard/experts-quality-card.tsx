import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Metrics } from "@/config/sheets";
import { Star, TrendingUp, AlertTriangle, Medal } from "lucide-react";

interface ExpertsQualityCardProps {
  data: Metrics[];
}

interface ExpertStats {
  name: string;
  count: number;
  totalGrupoScore: number;
  totalLiveScore: number;
  liveCount: number;
}

export function ExpertsQualityCard({ data }: ExpertsQualityCardProps) {
  // Agrupar por Expert
  const stats: Record<string, ExpertStats> = {};

  data.forEach(item => {
    if (!item.clientName) return;

    if (!stats[item.clientName]) {
      stats[item.clientName] = { 
        name: item.clientName, 
        count: 0, 
        totalGrupoScore: 0, 
        totalLiveScore: 0,
        liveCount: 0
      };
    }

    // Soma scores se forem válidos (> 0)
    if (item.grupo_score > 0) {
       stats[item.clientName].totalGrupoScore += item.grupo_score;
       stats[item.clientName].count += 1;
    }
    
    // Soma live scores apenas se houve live
    if (item.live_assistida?.toUpperCase() === 'SIM' && item.score_live_total > 0) {
       stats[item.clientName].totalLiveScore += item.score_live_total;
       stats[item.clientName].liveCount += 1;
    }
  });

  const ranking = Object.values(stats)
    .map(expert => {
        const avgGrupo = expert.count > 0 ? expert.totalGrupoScore / expert.count : 0;
        const avgLive = expert.liveCount > 0 ? expert.totalLiveScore / expert.liveCount : 0;
        
        // Veredito simplificado baseado nas médias
        let verdictText = "Em Análise";
        let verdictColor = "text-muted-foreground";

        if (avgGrupo >= 3.0 && avgLive >= 15) {
            verdictText = "Excelente";
            verdictColor = "text-green-500";
        } else if (avgGrupo >= 3.0) {
            verdictText = "Bom Grupo";
            verdictColor = "text-blue-400";
        } else if (avgLive >= 15) {
            verdictText = "Boa Live";
            verdictColor = "text-yellow-500";
        } else if (avgGrupo > 0 || avgLive > 0) {
            verdictText = "Atenção";
            verdictColor = "text-red-400";
        } else {
            verdictText = "Sem Dados";
        }

        return {
            ...expert,
            avgGrupo,
            avgLive,
            verdictText,
            verdictColor
        };
    })
    // Ordenar por média de grupo (ou critério principal de qualidade)
    .sort((a, b) => b.avgGrupo - a.avgGrupo);

  return (
    <Card className="border-border/50 bg-card/95 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Qualidade Média por Expert</CardTitle>
        <Medal className="h-4 w-4 text-purple-500" />
      </CardHeader>
      
      <CardContent className="flex-1 min-h-0 pt-2 px-0">
        <ScrollArea className="h-[300px] px-4">
          <div className="space-y-4">
            {ranking.map((expert, idx) => (
              <div key={idx} className="flex flex-col gap-2 border-b border-muted/50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm truncate max-w-[120px] sm:max-w-[150px]" title={expert.name}>
                    {idx + 1}. {expert.name}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted/30 ${expert.verdictColor}`}>
                    {expert.verdictText}
                  </span>
                </div>
                
                {/* Grid de Médias */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Grupo Score Médio */}
                  <div className="flex flex-col items-center p-1.5 rounded bg-muted/20">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5 text-center">Média Grupo</span>
                    <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="font-mono font-bold">
                            {expert.avgGrupo > 0 ? expert.avgGrupo.toFixed(1) : '-'}
                        </span>
                    </div>
                  </div>

                  {/* Live Score Médio */}
                  <div className="flex flex-col items-center p-1.5 rounded bg-muted/20">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5 text-center">Média Live</span>
                    <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-red-500" />
                        <span className="font-mono font-bold">
                            {expert.avgLive > 0 ? expert.avgLive.toFixed(1) : '-'}
                        </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {ranking.length === 0 && (
                <div className="text-center text-muted-foreground text-xs py-8">
                    Sem dados de qualidade no período.
                </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

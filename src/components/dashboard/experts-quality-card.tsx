import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Metrics } from "@/config/sheets";
import { Star, TrendingUp, TrendingDown, Minus, Medal, Users, UserCheck } from "lucide-react";

interface ExpertsQualityCardProps {
  data: Metrics[];
  previousData?: Metrics[];
}

interface ExpertStats {
  name: string;
  count: number;
  totalGrupoScore: number;
  
  // Live Data
  totalLiveScore: number;
  liveCount: number;
  
  // Somas para média
  totalPico: number;
  countPico: number;
  totalFinal: number;
  countFinal: number;
}

export function ExpertsQualityCard({ data, previousData }: ExpertsQualityCardProps) {
  // Agrupar por Expert (Dados Atuais)
  const stats: Record<string, ExpertStats> = {};

  const processData = (metrics: Metrics[], targetStats: Record<string, ExpertStats>) => {
    metrics.forEach(item => {
        if (!item.clientName) return;

        if (!targetStats[item.clientName]) {
        targetStats[item.clientName] = { 
            name: item.clientName, 
            count: 0, 
            totalGrupoScore: 0, 
            totalLiveScore: 0,
            liveCount: 0,
            totalPico: 0,
            countPico: 0,
            totalFinal: 0,
            countFinal: 0
        };
        }

        const s = targetStats[item.clientName];

        // Soma scores se forem válidos (> 0)
        if (item.grupo_score > 0) {
            s.totalGrupoScore += item.grupo_score;
            s.count += 1;
        }
        
        // Soma live scores
        if (item.live_assistida?.toUpperCase() === 'SIM') {
            if (item.score_live_total > 0) {
                s.totalLiveScore += item.score_live_total;
            }
            s.liveCount += 1;
            
            if (item.pico_live > 0) {
                s.totalPico += item.pico_live;
                s.countPico += 1;
            }
            
            if (item.final_live > 0) {
                s.totalFinal += item.final_live;
                s.countFinal += 1;
            }
        }
    });
  };

  processData(data, stats);
  
  // Agrupar por Expert (Dados Anteriores)
  const prevStats: Record<string, ExpertStats> = {};
  if (previousData) {
      processData(previousData, prevStats);
  }

  // Helper para calcular evolução
  const calculateEvolution = (currentAvg: number, prevAvg: number) => {
      if (currentAvg === 0 || prevAvg === 0) return { direction: 'neutral', percent: 0 };
      
      const delta = currentAvg - prevAvg;
      const percent = (delta / prevAvg) * 100;
      
      let direction = 'neutral';
      if (percent >= 5) direction = 'up';
      else if (percent <= -5) direction = 'down';
      
      return { direction, percent };
  };

  const getTrendIcon = (evolution: { direction: string, percent: number }) => {
      const colorClass = evolution.direction === 'up' ? "text-emerald-500" : evolution.direction === 'down' ? "text-rose-500" : "text-muted-foreground";
      
      return (
          <div className="flex items-center gap-1">
              {evolution.direction === 'up' && <TrendingUp className={`h-3 w-3 ${colorClass}`} />}
              {evolution.direction === 'down' && <TrendingDown className={`h-3 w-3 ${colorClass}`} />}
              {evolution.direction === 'neutral' && <Minus className={`h-3 w-3 ${colorClass}`} />}
              
              {evolution.direction !== 'neutral' && (
                  <span className={`text-[10px] font-medium ${colorClass}`}>
                     {evolution.percent > 0 ? '+' : ''}{Math.round(evolution.percent)}%
                  </span>
              )}
          </div>
      );
  };

  const ranking = Object.values(stats)
    .map(expert => {
        const avgGrupo = expert.count > 0 ? expert.totalGrupoScore / expert.count : 0;
        const avgLive = expert.liveCount > 0 ? expert.totalLiveScore / expert.liveCount : 0;
        
        const avgPico = expert.countPico > 0 ? expert.totalPico / expert.countPico : 0;
        const avgFinal = expert.countFinal > 0 ? expert.totalFinal / expert.countFinal : 0;
        
        // Dados anteriores para comparação
        const prevExpert = prevStats[expert.name];
        const prevAvgPico = prevExpert && prevExpert.countPico > 0 ? prevExpert.totalPico / prevExpert.countPico : 0;
        const prevAvgFinal = prevExpert && prevExpert.countFinal > 0 ? prevExpert.totalFinal / prevExpert.countFinal : 0;
            
        // Evolução
        const trendPico = calculateEvolution(avgPico, prevAvgPico);
        const trendFinal = calculateEvolution(avgFinal, prevAvgFinal);
        
        let verdictText = "Em Análise";
        let verdictColor = "text-muted-foreground border-border";
        
        // ... (resto da lógica de veredicto igual)
        if (avgGrupo >= 3.0 && avgLive >= 15) {
            verdictText = "Excelente";
            verdictColor = "text-green-500 border-green-500/30 bg-green-500/10";
        } else if (avgGrupo >= 3.0) {
            verdictText = "Bom Grupo";
            verdictColor = "text-blue-400 border-blue-400/30 bg-blue-400/10";
        } else if (avgLive >= 15) {
            verdictText = "Boa Live";
            verdictColor = "text-yellow-500 border-yellow-500/30 bg-yellow-500/10";
        } else if (avgGrupo > 0 || avgLive > 0) {
            verdictText = "Atenção";
            verdictColor = "text-red-400 border-red-400/30 bg-red-400/10";
        }

        return {
            ...expert,
            avgGrupo,
            avgLive,
            avgPico,
            avgFinal,
            trendPico,
            trendFinal,
            verdictText,
            verdictColor
        };
    })
    .sort((a, b) => b.avgGrupo - a.avgGrupo);

  return (
    <Card className="border-border/50 bg-card w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
           <CardTitle className="text-sm font-medium flex items-center gap-2">
             <Medal className="h-4 w-4 text-purple-500" />
             Qualidade Média por Expert
           </CardTitle>
           <span className="text-xs text-muted-foreground">{ranking.length} experts</span>
        </div>
      </CardHeader>
      
      <CardContent className="px-0 pb-4">
        <ScrollArea className="w-full whitespace-nowrap px-6">
          <div className="flex gap-4">
            {ranking.map((expert, idx) => (
              <div 
                key={idx} 
                className="flex flex-col gap-3 min-w-[280px] p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm truncate max-w-[140px]" title={expert.name}>
                    {expert.name}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${expert.verdictColor}`}>
                    {expert.verdictText}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                  {/* Grupo */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Média Grupo</span>
                    <div className="flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500/20" />
                        <span className="font-mono font-bold text-lg">
                            {expert.avgGrupo > 0 ? expert.avgGrupo.toFixed(1) : '-'}
                        </span>
                    </div>
                  </div>

                  {/* Live Score */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Score Live</span>
                    <div className="flex items-center gap-1.5">
                        <Medal className="h-3.5 w-3.5 text-blue-500" />
                        <span className="font-mono font-bold text-lg">
                            {expert.avgLive > 0 ? expert.avgLive.toFixed(1) : '-'}
                        </span>
                    </div>
                  </div>

                  {/* Pico Live */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Pico Live</span>
                    <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-violet-500" />
                        <span className="font-mono font-bold text-base">
                            {expert.avgPico > 0 ? Math.round(expert.avgPico).toLocaleString('pt-BR') : '-'}
                        </span>
                        {expert.avgPico > 0 && getTrendIcon(expert.trendPico)}
                    </div>
                  </div>

                  {/* Final Live */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Final Live</span>
                    <div className="flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-pink-500" />
                        <span className="font-mono font-bold text-base">
                            {expert.avgFinal > 0 ? Math.round(expert.avgFinal).toLocaleString('pt-BR') : '-'}
                        </span>
                        {expert.avgFinal > 0 && getTrendIcon(expert.trendFinal)}
                    </div>
                  </div>

                </div>
              </div>
            ))}

            {ranking.length === 0 && (
                <div className="text-center text-muted-foreground text-xs py-4 w-full">
                    Sem dados de qualidade no período.
                </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

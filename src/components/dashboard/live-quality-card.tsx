import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Metrics } from "@/config/sheets";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Zap, Award, TrendingUp, AlertTriangle } from "lucide-react";

interface LiveQualityCardProps {
  data: Metrics[];
}

export function LiveQualityCard({ data }: LiveQualityCardProps) {
  // Ordena por data decrescente e remove datas futuras
  const sorted = useMemo(() => {
      const now = new Date();
      now.setHours(23, 59, 59, 999); // Inclui o dia de hoje inteiro

      return [...data]
        .filter(item => {
            const parts = item.date.split('/');
            if (parts.length !== 3) return false;
            const itemDate = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
            return itemDate <= now;
        })
        .sort((a, b) => {
            const parse = (d: string) => {
                const parts = d.split('/');
                return new Date(`${parts[1]}/${parts[0]}/${parts[2]}`).getTime();
            };
            return parse(b.date) - parse(a.date); // Decrescente
        });
  }, [data]);

  // Cálculo de Médias para o Relatório
  const validScores = data.filter(d => d.grupo_score > 0);
  const avgGrupoScore = validScores.length > 0 
    ? validScores.reduce((acc, curr) => acc + curr.grupo_score, 0) / validScores.length 
    : 0;

  const lives = data.filter(d => d.live_assistida?.toUpperCase() === 'SIM');
  const avgLiveScore = lives.length > 0
    ? lives.reduce((acc, curr) => acc + curr.score_live_total, 0) / lives.length
    : 0;

  // Geração do Veredito Automático
  const getVerdict = () => {
    if (data.length === 0) return { text: "Sem dados suficientes", color: "text-muted-foreground", icon: AlertTriangle };
    
    if (avgGrupoScore >= 3.0 && avgLiveScore >= 15) return { text: "Performance Excelente! Comunidade engajada e lives de alta conversão.", color: "text-green-500", icon: TrendingUp };
    if (avgGrupoScore >= 3.0) return { text: "Boa gestão de comunidade, mas as lives podem melhorar.", color: "text-blue-400", icon: Users };
    if (avgLiveScore >= 15) return { text: "Lives ótimas, mas o dia-a-dia do grupo precisa de atenção.", color: "text-yellow-500", icon: Zap };
    
    return { text: "Atenção: Indicadores de qualidade abaixo da meta.", color: "text-red-400", icon: AlertTriangle };
  };

  const verdict = getVerdict();

  return (
    <Card className="border-border/50 bg-card h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Qualidade & Performance</CardTitle>
        <Star className="h-4 w-4 text-yellow-500" />
      </CardHeader>
      
      {/* Mini Relatório Automático */}
      <div className="px-6 py-2">
        <div className={`flex items-start gap-2 p-3 rounded-lg bg-muted/20 border border-muted/30 ${verdict.color}`}>
            <verdict.icon className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="text-xs font-medium leading-tight">{verdict.text}</p>
        </div>
      </div>

      <CardContent className="flex-1 min-h-0 pt-2">
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {sorted.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-2 border-b border-muted pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-[10px]">{item.date}</Badge>
                  
                  {/* Destaque visual se for dia de Live */}
                  <div className="flex items-center gap-2">
                    {item.live_assistida?.toUpperCase() === 'SIM' ? (
                        <div className="flex items-center gap-1">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-red-400">LIVE ({item.score_live_total}/20)</span>
                        </div>
                    ) : (
                        <span className="text-[10px] text-muted-foreground">Sem Live</span>
                    )}
                  </div>
                </div>
                
                {/* Grid de Métricas Compacto */}
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {/* Pico */}
                  <div className="flex flex-col items-center p-1.5 rounded bg-muted/30">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Pico</span>
                    <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-blue-400" />
                        <span className="font-mono font-bold">{item.pico_live}</span>
                    </div>
                  </div>

                  {/* Grupo Score */}
                  <div className="flex flex-col items-center p-1.5 rounded bg-muted/30">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Grupo</span>
                    <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-yellow-400" />
                        <span className={`font-mono font-bold ${item.grupo_score >= 3 ? 'text-green-400' : 'text-foreground'}`}>
                            {item.grupo_score}
                        </span>
                    </div>
                  </div>

                  {/* IEE */}
                  <div className="flex flex-col items-center p-1.5 rounded bg-muted/30">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">IEE</span>
                    <div className="flex items-center gap-1">
                        <Award className="h-3 w-3 text-purple-400" />
                        <span className="font-mono font-bold">{item.iee_indice.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Final */}
                  <div className="flex flex-col items-center p-1.5 rounded bg-muted/30">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Final</span>
                    <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-green-400" />
                        <span className="font-mono font-bold">{item.final_live}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

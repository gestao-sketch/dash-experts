import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, Rocket } from "lucide-react";

interface ExpertStatusBadgeProps {
  classificacao: string;
  tendencia: string;
  lastUpdate?: string;
}

export function ExpertStatusBadge({ classificacao, tendencia, lastUpdate }: ExpertStatusBadgeProps) {
  // Helpers para descrição
  const getClassificacaoDesc = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes("ESCALAR")) return "ROAS ≥ 1.5 nos últimos 7 dias. Cenário seguro e lucrativo para aumentar o investimento.";
    if (s.includes("MANTER")) return "ROAS entre 1.0 e 1.49. O expert se paga, mas não há margem segura para escalar agressivamente.";
    if (s.includes("RISCO")) return "ROAS < 1.0 nos últimos 7 dias. A operação está dando prejuízo.";
    if (s.includes("SEM DADOS")) return "Não há dados suficientes de investimento e retorno nos últimos 7 dias.";
    return "Status calculado com base no ROAS dos últimos 7 dias.";
  };

  const getTendenciaDesc = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes("SUBINDO")) return "Faturamento cresceu > 10% em relação aos 7 dias anteriores.";
    if (s.includes("DESCENDO")) return "Faturamento caiu > 10% em relação aos 7 dias anteriores.";
    if (s.includes("ESTÁVEL")) return "Faturamento variou menos de 10% em relação ao período anterior.";
    return "Tendência calculada com base na variação de faturamento dos últimos 7 dias.";
  };

  // Se não tiver dados, mostra um badge neutro para debug/feedback visual
  if ((!classificacao || classificacao === "N/A") && (!tendencia || tendencia === "N/A")) {
      return (
        <Badge variant="outline" className="px-3 py-1 bg-muted/50 text-muted-foreground font-medium text-[10px] uppercase tracking-wide border-dashed">
            Sem Status
        </Badge>
      );
  }

  const getClassificacaoStyle = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes("ESCALAR")) return "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30 hover:bg-green-500/25";
    if (s.includes("MANTER")) return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/25";
    if (s.includes("RISCO")) return "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-500/25";
    return "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30";
  };

  const getClassificacaoIcon = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes("ESCALAR")) return <Rocket className="w-3.5 h-3.5 mr-1.5" />;
    if (s.includes("MANTER")) return <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />;
    if (s.includes("RISCO")) return <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />;
    return null;
  };

  const getTendenciaIcon = (trend: string) => {
    const t = trend.toUpperCase();
    if (t.includes("SUBINDO")) return <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />;
    if (t.includes("DESCENDO")) return <TrendingDown className="w-3.5 h-3.5 mr-1.5 text-rose-500" />;
    return <Minus className="w-3.5 h-3.5 mr-1.5 text-blue-400" />;
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-500">
        
        {/* Tooltip para Classificação */}
        {classificacao && classificacao !== "N/A" && (
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className={`px-3 py-1 font-bold tracking-wide uppercase cursor-help ${getClassificacaoStyle(classificacao)}`}>
                    {getClassificacaoIcon(classificacao)}
                    {classificacao}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[280px] bg-popover text-popover-foreground border border-border shadow-xl p-4">
                    <p className="font-semibold mb-2 text-sm flex items-center gap-2">
                        {getClassificacaoIcon(classificacao)}
                        {classificacao}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{getClassificacaoDesc(classificacao)}</p>
                    {lastUpdate && <p className="text-[10px] text-muted-foreground/50 mt-3 pt-2 border-t border-border/50">Dados atualizados em: {lastUpdate}</p>}
                </TooltipContent>
            </Tooltip>
        )}
        
        {/* Tooltip para Tendência */}
        {tendencia && tendencia !== "N/A" && (
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="px-3 py-1 bg-background/50 border-border/60 text-muted-foreground font-medium uppercase tracking-wide cursor-help hover:bg-muted/50 transition-colors">
                    {getTendenciaIcon(tendencia)}
                    {tendencia}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[280px] bg-popover text-popover-foreground border border-border shadow-xl p-4">
                    <p className="font-semibold mb-2 text-sm flex items-center gap-2">
                         {getTendenciaIcon(tendencia)}
                         {tendencia}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{getTendenciaDesc(tendencia)}</p>
                    {lastUpdate && <p className="text-[10px] text-muted-foreground/50 mt-3 pt-2 border-t border-border/50">Dados atualizados em: {lastUpdate}</p>}
                </TooltipContent>
            </Tooltip>
        )}

      </div>
    </TooltipProvider>
  );
}

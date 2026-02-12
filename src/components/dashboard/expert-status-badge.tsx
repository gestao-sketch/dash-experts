import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, Rocket } from "lucide-react";

interface ExpertStatusBadgeProps {
  classificacao: string;
  tendencia: string;
}

export function ExpertStatusBadge({ classificacao, tendencia }: ExpertStatusBadgeProps) {
  if ((!classificacao || classificacao === "N/A") && (!tendencia || tendencia === "N/A")) {
      return null;
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
    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-500">
      {classificacao && classificacao !== "N/A" && (
          <Badge variant="outline" className={`px-3 py-1 font-bold tracking-wide uppercase ${getClassificacaoStyle(classificacao)}`}>
            {getClassificacaoIcon(classificacao)}
            {classificacao}
          </Badge>
      )}
      
      {tendencia && tendencia !== "N/A" && (
          <Badge variant="outline" className="px-3 py-1 bg-background/50 border-border/60 text-muted-foreground font-medium uppercase tracking-wide">
            {getTendenciaIcon(tendencia)}
            {tendencia}
          </Badge>
      )}
    </div>
  );
}

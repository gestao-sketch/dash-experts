import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Metrics } from "@/config/sheets";
import { Calendar, User } from "lucide-react";

interface DailySummaryProps {
  data: Metrics[];
}

export function DailySummaryCard({ data }: DailySummaryProps) {
  // Calcular a data de Ontem para filtro padrão
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const day = String(yesterday.getDate()).padStart(2, '0');
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const year = yesterday.getFullYear();
  const yesterdayStr = `${day}/${month}/${year}`;

  // Filtrar apenas registros de Ontem que tenham conteúdo
  const items = data.filter(d => 
    d.date === yesterdayStr && (d.resumo_80_20 || d.detalhado)
  );

  // Se não tiver nada de ontem, tenta pegar o último registro disponível (caso ontem tenha sido feriado/fds sem preenchimento)
  // Mas como o pedido foi "Dia Anterior", vamos focar nisso ou mostrar mensagem vazia
  
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Diário de Bordo ({yesterdayStr})
            </CardTitle>
            <Badge variant="secondary" className="font-normal text-xs">
                {items.length} registros
            </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.length === 0 ? (
                <div className="col-span-2 py-8 text-center text-muted-foreground text-sm">
                    Nenhum diário de bordo preenchido para esta data.
                </div>
            ) : (
                items.map((item, idx) => (
                    <div 
                        key={idx} 
                        className="flex flex-col gap-3 p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 transition-colors"
                    >
                        {/* Header do Expert */}
                        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <User className="h-3 w-3" />
                            </div>
                            <span className="font-bold text-sm text-foreground">
                                {item.clientName || "Expert"}
                            </span>
                        </div>

                        {/* Conteúdo */}
                        <div className="space-y-3 pt-1">
                            {item.resumo_80_20 && (
                                <div>
                                    <p className="text-[10px] font-bold text-chart-1 uppercase tracking-widest mb-1.5">
                                        80/20 DO DIA
                                    </p>
                                    <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                        {item.resumo_80_20}
                                    </p>
                                </div>
                            )}

                            {item.detalhado && (
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 mt-2">
                                        DETALHAMENTO
                                    </p>
                                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {item.detalhado}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
      </CardContent>
    </Card>
  );
}

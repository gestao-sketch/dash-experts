import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Metrics } from "@/config/sheets";

interface DailySummaryProps {
  data: Metrics[];
}

export function DailySummaryCard({ data }: DailySummaryProps) {
  // Pega apenas os dados de hoje ou o mais recente do array
  // Mas como o filtro do dash já manda os dados filtrados, vamos mostrar todos que tiverem conteúdo
  
  const itemsWithContent = data.filter(d => d.resumo_80_20 || d.detalhado);

  if (itemsWithContent.length === 0) return null;

  // Ordena por data decrescente
  const sorted = [...itemsWithContent].sort((a, b) => {
     const parse = (d: string) => {
        const parts = d.split('/');
        return new Date(`${parts[1]}/${parts[0]}/${parts[2]}`).getTime();
    };
    return parse(b.date) - parse(a.date);
  });

  return (
    <Card className="col-span-1 lg:col-span-2 border-border/50 bg-card/95 h-full">
      <CardHeader>
        <CardTitle>Diário de Bordo</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-6">
            {sorted.map((item, idx) => (
              <div key={idx} className="relative border-l border-muted pl-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">{item.date}</Badge>
                </div>
                
                {item.resumo_80_20 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      80/20 do Dia
                    </p>
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {item.resumo_80_20}
                    </p>
                  </div>
                )}

                {item.detalhado && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Detalhamento
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {item.detalhado}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

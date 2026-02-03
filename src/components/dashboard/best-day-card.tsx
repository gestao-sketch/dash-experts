import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface BestDayCardProps {
  date: string;
  revenue: number;
  roas: number;
}

export function BestDayCard({ date, revenue, roas }: BestDayCardProps) {
  return (
    <Card className="border-border/50 bg-gradient-to-br from-card/95 to-chart-1/10 h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Melhor Dia (Depósitos)
        </CardTitle>
        <Trophy className="h-4 w-4 text-chart-1" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-2">
        <div className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            {date}
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="flex flex-col p-2 bg-background/40 rounded-md">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Depósito</span>
            <span className="font-mono font-bold text-chart-1 text-sm sm:text-base truncate">
              R$ {revenue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
          
          <div className="flex flex-col p-2 bg-background/40 rounded-md">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">ROAS</span>
            <span className="font-mono font-bold text-chart-2 text-sm sm:text-base">
              {roas.toFixed(2)}x
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

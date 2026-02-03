import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface ForecastCardProps {
  next7DaysRevenue: number;
  trend: number; // percentage growth/decline
}

export function ForecastCard({ next7DaysRevenue, trend }: ForecastCardProps) {
  return (
    <Card className="border-border/50 bg-gradient-to-br from-card/50 to-chart-3/10 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Previsão (7 dias)
        </CardTitle>
        <TrendingUp className="h-4 w-4 text-chart-3" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          R$ {next7DaysRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Baseado na performance recente dos últimos 30 dias.
        </p>
      </CardContent>
    </Card>
  );
}

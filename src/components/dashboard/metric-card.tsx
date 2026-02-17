import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: number; // percentage
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  color?: "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5";
  description?: string;
}

const colorMap = {
  "chart-1": "text-chart-1",
  "chart-2": "text-chart-2",
  "chart-3": "text-chart-3",
  "chart-4": "text-chart-4",
  "chart-5": "text-chart-5",
};

const trendColorMap = {
  up: "text-emerald-500",
  down: "text-rose-500",
  neutral: "text-muted-foreground",
};

export function MetricCard({ title, value, change, trend, icon, color = "chart-1", description }: MetricCardProps) {
  const iconColorClass = colorMap[color] || "text-chart-1";

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className={cn("h-4 w-4", iconColorClass)}>{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", iconColorClass)}>{value}</div>
        {(change !== undefined || description) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            {change !== undefined && (
              <span className={cn(
                "mr-2 flex items-center font-medium",
                trend ? trendColorMap[trend] : "text-muted-foreground"
              )}>
                {trend === "up" && <ArrowUp className="mr-1 h-3 w-3" />}
                {trend === "down" && <ArrowDown className="mr-1 h-3 w-3" />}
                {trend === "neutral" && <Minus className="mr-1 h-3 w-3" />}
                {Math.abs(change)}%
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

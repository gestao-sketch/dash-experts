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

export function MetricCard({ title, value, change, trend, icon, color = "chart-1", description }: MetricCardProps) {
  return (
    <Card className="border-border/50 bg-card/95">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className={cn("h-4 w-4", `text-${color}`)}>{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", `text-${color}`)}>{value}</div>
        {(change !== undefined || description) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            {change !== undefined && (
              <span className={cn(
                "mr-2 flex items-center font-medium",
                trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-gray-500"
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

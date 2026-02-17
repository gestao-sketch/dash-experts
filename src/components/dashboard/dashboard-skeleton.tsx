import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[180px]" />
        </div>
      </div>

      {/* KPI Grid 1 */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>

      {/* KPI Grid 2 */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-6">
        {/* Quality Card */}
        <Skeleton className="h-64 w-full rounded-xl" />
        
        {/* Chart */}
        <Skeleton className="h-[400px] w-full rounded-xl" />
        
        {/* Top Experts / Daily Summary */}
        <div className="grid gap-6 md:grid-cols-2">
             <Skeleton className="h-64 w-full rounded-xl" />
             <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

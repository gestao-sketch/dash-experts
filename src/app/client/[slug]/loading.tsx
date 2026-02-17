import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default function Loading() {
  return (
    <div className="p-4 md:p-8">
      <DashboardSkeleton />
    </div>
  );
}

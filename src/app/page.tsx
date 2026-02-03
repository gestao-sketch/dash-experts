import { fetchAllClientsData } from "@/lib/google-sheets";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { Metrics } from "@/config/sheets";

export const revalidate = 300; // Revalidate every 5 minutes

export default async function Home() {
  const allDataMap = await fetchAllClientsData();
  
  // Flatten all data into one array for the overview
  const allData: Metrics[] = Object.values(allDataMap).flat();

  return <DashboardView data={allData} title="Visão Geral (Todos os Clientes)" />;
}

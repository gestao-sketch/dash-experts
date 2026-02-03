import { fetchClientData, fetchClients } from "@/lib/google-sheets";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { notFound } from "next/navigation";

export const revalidate = 300;

// Dynamic params because clients can change
// We can use generateStaticParams for build time, but allow dynamic for new ones
export const dynamicParams = true; 

export async function generateStaticParams() {
  const clients = await fetchClients();
  return clients.map((client) => ({
    slug: client.slug,
  }));
}

export default async function ClientPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const clients = await fetchClients();
  const client = clients.find(c => c.slug === slug);
  
  if (!client) return notFound();

  const data = await fetchClientData(slug);

  return <DashboardView data={data} title={`Dashboard - ${client.name}`} />;
}

import Link from "next/link";
import { fetchClients } from "@/lib/google-sheets";
import { SidebarNav } from "./sidebar-nav"; // Client Component wrapper
import { Settings } from "lucide-react";
import Image from "next/image";

export async function Sidebar() {
  const clients = await fetchClients();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-20 items-center justify-center border-b border-border px-6">
        <Link href="/" className="flex items-center gap-2">
           <div className="relative h-12 w-12">
             {/* Aplicando filtro para garantir que fique branco no fundo escuro */}
             <Image 
               src="/logo-arca.png" 
               alt="Arca Logo" 
               fill
               className="object-contain" 
               priority
             />
           </div>
           <span className="text-xl font-bold tracking-tight">Dash Arca</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <SidebarNav clients={clients} />
      </div>
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-primary cursor-not-allowed opacity-50">
          <Settings className="h-4 w-4" />
          Configurações
        </div>
      </div>
    </div>
  );
}

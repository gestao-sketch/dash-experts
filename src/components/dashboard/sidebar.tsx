import Link from "next/link";
import { fetchClients } from "@/lib/google-sheets";
import { SidebarNav } from "./sidebar-nav";
import { Settings } from "lucide-react";
import Image from "next/image";
import { ModeToggle } from "@/components/mode-toggle";

export async function Sidebar() {
  const clients = await fetchClients();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-20 items-center justify-center border-b border-border px-6">
        <Link href="/" className="flex items-center gap-2">
           <div className="relative h-12 w-12">
             {/* Logo para LIGHT MODE (Nova) */}
             <Image 
               src="/logo-light.png" 
               alt="Arca Logo" 
               fill
               className="object-contain dark:hidden transition-all duration-300" 
               priority
             />
             {/* Logo para DARK MODE (Antiga, Branca) */}
             <Image 
               src="/logo-arca.png" 
               alt="Arca Logo" 
               fill
               className="object-contain hidden dark:block transition-all duration-300" 
               priority
             />
           </div>
           <span className="text-xl font-bold tracking-tight">Dash Arca</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <SidebarNav clients={clients} />
      </div>
      <div className="border-t border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-primary cursor-not-allowed opacity-50">
          <Settings className="h-4 w-4" />
          <span>Config</span>
        </div>
        <ModeToggle />
      </div>
    </div>
  );
}

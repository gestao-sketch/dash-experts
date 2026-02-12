"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { ClientConfig } from "@/config/sheets";
import Image from "next/image";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

export function MobileNav({ clients }: { clients: ClientConfig[] }) {
  return (
    <div className="flex items-center p-4 border-b border-border md:hidden bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/60">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="mr-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0 bg-sidebar border-r-border w-[280px]">
          <div className="flex items-center justify-center px-6 py-4 border-b border-border mb-4 h-20">
             <Link href="/" className="flex items-center gap-2">
                <div className="relative h-10 w-10">
                  {/* Light Mode */}
                  <Image 
                    src="/logo-light.png" 
                    alt="Arca Logo" 
                    fill
                    className="object-contain dark:hidden transition-all" 
                    priority
                  />
                  {/* Dark Mode */}
                  <Image 
                    src="/logo-arca.png" 
                    alt="Arca Logo" 
                    fill
                    className="object-contain hidden dark:block transition-all" 
                    priority
                  />
                </div>
                <span className="text-lg font-bold tracking-tight">Dash Arca</span>
             </Link>
          </div>
          <div className="px-2">
             <SidebarNav clients={clients} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-center">
             <ModeToggle />
          </div>
        </SheetContent>
      </Sheet>
      <div className="flex items-center gap-2 ml-auto sm:ml-0">
        <div className="relative h-8 w-8">
            {/* Light Mode */}
            <Image 
              src="/logo-light.png" 
              alt="Arca Logo" 
              fill
              className="object-contain dark:hidden transition-all" 
            />
            {/* Dark Mode */}
            <Image 
              src="/logo-arca.png" 
              alt="Arca Logo" 
              fill
              className="object-contain hidden dark:block transition-all" 
            />
        </div>
        <span className="font-bold text-sm">Dash Arca</span>
      </div>
    </div>
  );
}

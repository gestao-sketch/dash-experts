import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { fetchClients } from "@/lib/google-sheets";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dash Arca - Dashboard",
  description: "Monitoramento de Performance e Resultados",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch clients once for layout (server-side)
  const clients = await fetchClients();

  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col md:flex-row h-screen overflow-hidden bg-background text-foreground`}
      >
        {/* Sidebar Desktop (Hidden on Mobile) */}
        <div className="hidden md:block">
           <Sidebar />
        </div>

        {/* Mobile Nav (Hidden on Desktop) */}
        <MobileNav clients={clients} />

        <main className="flex-1 overflow-y-auto bg-background/50 p-4 md:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}

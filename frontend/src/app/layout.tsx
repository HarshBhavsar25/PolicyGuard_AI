import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { logout } from "@/app/login/actions";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PolicyGuard AI - Compliance Agent",
  description: "AI-powered data policy compliance agent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-slate-50 antialiased`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden bg-[#0A0A0A]">
            <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md px-6 z-10">
              <h1 className="text-xl font-semibold text-white truncate">Dashboard</h1>
              <div className="flex items-center gap-4">
                <div className="relative w-64 hidden md:block">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full bg-zinc-900 border-zinc-800 pl-9 h-9 text-sm focus-visible:ring-blue-500"
                  />
                </div>
                <button className="text-zinc-400 hover:text-white transition-colors">
                  <Bell className="h-5 w-5" />
                </button>
                <form action={logout}>
                  <button type="submit" className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-medium hover:bg-red-500 hover:text-white transition-colors" title="Logout">
                    HJ
                  </button>
                </form>
              </div>
            </header>
            <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-zinc-950/0 to-zinc-950/0 pointer-events-none" />
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

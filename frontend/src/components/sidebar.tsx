"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Database, AlertCircle, BarChart3, Settings, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Policies", href: "/policies", icon: FileText },
    { name: "Rule Engine", href: "/rules", icon: Settings },
    { name: "Datasets", href: "/datasets", icon: Database },
    { name: "Violations", href: "/violations", icon: AlertCircle },
    { name: "Reports", href: "/reports", icon: BarChart3 },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col bg-zinc-950 border-r border-zinc-800 text-zinc-300">
            <div className="flex h-16 shrink-0 items-center px-6 border-b border-zinc-800">
                <ShieldCheck className="h-6 w-6 text-blue-500 mr-2" />
                <span className="font-bold text-white text-lg tracking-wide">PolicyGuard AI</span>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto">
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    isActive
                                        ? "bg-zinc-900 text-blue-400"
                                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white",
                                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        isActive ? "text-blue-500" : "text-zinc-500 group-hover:text-zinc-300",
                                        "mr-3 h-5 w-5 shrink-0 transition-colors duration-200"
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="p-4 border-t border-zinc-800 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                        PG
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">PolicyGuard</span>
                        <span className="text-xs text-zinc-500">Enterprise</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

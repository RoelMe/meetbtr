"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/UserMenu";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-50">
            <DashboardSidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
            <main className="flex-1 transition-all duration-300 md:ml-16 flex flex-col">
                <header className="h-20 flex items-center justify-end px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                            <Bell className="w-5 h-5" />
                        </Button>
                        <UserMenu />
                    </div>
                </header>
                <div className="flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}

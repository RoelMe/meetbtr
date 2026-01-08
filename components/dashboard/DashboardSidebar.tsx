"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Video, ListTodo, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "../ui/button";
import Image from "next/image";

const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: Video, label: "Meetings", href: "/dashboard/meetings" },
    { icon: ListTodo, label: "Action Items", href: "/dashboard/actions" },
];

interface DashboardSidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export function DashboardSidebar({ isCollapsed, onToggle }: DashboardSidebarProps) {
    const pathname = usePathname();

    return (
        <aside className={cn(
            "fixed left-0 top-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 z-50 flex flex-col",
            isCollapsed ? "w-16" : "w-64"
        )}>
            {/* Logo area */}
            <div className="h-20 flex items-center px-3 mb-4">
                <Link href="/" className="h-12 px-3 flex items-center shrink-0">
                    <div className="w-8 h-8 flex items-center justify-center -ml-1.5">
                        <Image
                            src="/meetmate.png"
                            alt="MeetMate Logo"
                            width={32}
                            height={32}
                            className="rounded-md shrink-0"
                        />
                    </div>
                    {!isCollapsed && (
                        <span className="ml-3.5 font-black text-xl tracking-tighter text-slate-900">meetbtr</span>
                    )}
                </Link>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center h-12 px-3 rounded-xl transition-all group relative",
                                isActive
                                    ? "bg-slate-100 text-slate-900"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 shrink-0",
                                isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"
                            )} />
                            {!isCollapsed && (
                                <span className={cn(
                                    "ml-3 font-bold text-sm tracking-tight",
                                    isActive ? "text-slate-900" : "text-slate-500"
                                )}>
                                    {item.label}
                                </span>
                            )}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-slate-900 rounded-r-full" />
                            )}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-3 border-t border-slate-100">
                <button
                    className="w-full flex items-center h-12 px-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all group"
                >
                    <Settings className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-slate-600" />
                    {!isCollapsed && (
                        <span className="ml-3 font-bold text-sm tracking-tight">Settings</span>
                    )}
                </button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggle}
                    className="absolute -right-3 top-24 h-6 w-6 rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 hidden md:flex"
                >
                    {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                </Button>
            </div>
        </aside>
    );
}

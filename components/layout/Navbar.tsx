"use client";

import React from "react";
import Image from "next/image";
import Link from 'next/link';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/UserMenu";
import { usePathname } from "next/navigation";

export function Navbar() {
    const { user } = useAuth();
    const pathname = usePathname();

    if (pathname.startsWith('/dashboard')) {
        return null;
    }

    return (
        <nav className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Image
                        src="/meetmate.png"
                        alt="MeetMate Logo"
                        width={32}
                        height={32}
                        className="rounded-md"
                    />
                    <span className="text-xl font-black tracking-tighter text-foreground">meetbtr</span>
                </Link>

                <div className="flex items-center gap-6">
                    {!user ? (
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground hidden sm:block">
                                Sign In
                            </Link>
                            <Link href="/new">
                                <Button className="rounded-lg font-bold">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Link
                                href="/dashboard"
                                className="text-sm font-semibold text-slate-600 hover:text-slate-600 transition-colors"
                            >
                                My Dashboard
                            </Link>

                            <UserMenu />
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

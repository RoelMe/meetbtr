"use client";

import React from "react";
import Link from 'next/link';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon } from "lucide-react";

export function UserMenu() {
    const { user, signOut, signInWithGoogle } = useAuth();

    if (!user) return null;

    const getUserInitials = (name: string | null) => {
        if (!name) return "U";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (error: any) {
            if (error.code === 'auth/operation-not-allowed') {
                alert(
                    "Google Sign-In is not enabled:\n\n" +
                    "Please go to your Firebase Console > Authentication > Settings > User sign-in and enable 'Google' to proceed."
                );
            } else {
                alert("Sign-in failed. Please try again.");
            }
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-white shadow-sm border border-slate-200 p-0 overflow-hidden hover:bg-slate-50 cursor-pointer">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                        <AvatarFallback className="bg-slate-100 text-slate-700 font-semibold">
                            {user.isAnonymous ? <UserIcon size={18} /> : getUserInitials(user.displayName)}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 z-[100]" align="end">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {user.isAnonymous ? "Guest User" : user.displayName}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user.isAnonymous ? "Joining as guest" : user.email}
                            </p>
                        </div>
                        {user.isAnonymous && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white border-0"
                                onClick={handleGoogleSignIn}
                            >
                                Sign in with Google
                            </Button>
                        )}
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

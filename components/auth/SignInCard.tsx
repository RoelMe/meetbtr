import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface SignInCardProps {
    onGoogleSignIn: () => Promise<void>;
    onEmailSignIn?: () => void;
    className?: string;
}

export function SignInCard({ onGoogleSignIn, onEmailSignIn, className }: SignInCardProps) {
    const handleEmailClick = () => {
        if (onEmailSignIn) {
            onEmailSignIn();
        } else {
            alert("Email sign-in is coming soon!");
        }
    };

    return (
        <div className={cn("bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 w-full max-w-md text-center", className)}>
            <div className="space-y-2 mb-8">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome to meetbtr</h2>
                <p className="text-slate-500 font-medium">Log in or create an account to continue</p>
            </div>

            <div className="space-y-4">
                <Button
                    onClick={onGoogleSignIn}
                    className="w-full h-12 text-base font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-500/20 flex items-center justify-center gap-2"
                >
                    {/* Google G Icon SVG */}
                    <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </Button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-slate-400 font-medium">or</span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    onClick={handleEmailClick}
                    className="w-full h-12 text-base font-bold rounded-xl border-gray-200 text-gray-900 hover:bg-gray-50 hover:text-gray-900"
                >
                    Continue with Email
                </Button>
            </div>

            <div className="mt-8 text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Already have an account? <span className="text-slate-900 font-bold cursor-pointer hover:underline">Sign in</span>
                <br />
                By proceeding, you agree to our{" "}
                <a href="#" className="hover:text-slate-900 hover:underline">Terms</a> and{" "}
                <a href="#" className="hover:text-slate-900 hover:underline">Privacy Policy</a>.
            </div>
        </div>
    );
}

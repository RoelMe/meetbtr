"use client";

import React, { useState, useEffect, useRef } from "react";
import { User, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

interface OwnerPickerProps {
    value: string;
    ownerId?: string;
    onSelect: (name: string, id?: string) => void;
    placeholder?: string;
    className?: string;
    autoFocus?: boolean;
    disabled?: boolean;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export function OwnerPicker({ value, ownerId, onSelect, placeholder = "Assignee", className, autoFocus, disabled, onBlur }: OwnerPickerProps) {
    const { user } = useAuth();
    const [inputValue, setInputValue] = useState(value);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const userName = user?.displayName || user?.email?.split('@')[0] || "Me";

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        // Auto-matching logic
        if (newValue.toLowerCase().trim() === userName.toLowerCase().trim()) {
            onSelect(userName, user?.uid);
        } else {
            onSelect(newValue, "");
        }
    };

    const selectMe = () => {
        onSelect(userName, user?.uid);
        setInputValue(userName);
        setIsOpen(false);
    };

    const selectGuest = () => {
        onSelect(inputValue || "Guest", "");
        if (!inputValue) setInputValue("Guest");
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => !disabled && setIsOpen(true)}
                    onBlur={onBlur}
                    className="pl-10 h-10 rounded-xl"
                    autoFocus={autoFocus}
                    disabled={disabled}
                />
            </div>

            {isOpen && (
                <div className="absolute bottom-full left-0 w-full mb-1 bg-white border border-slate-200 rounded-xl shadow-xl z-[100] overflow-hidden animate-in fade-in slide-in-from-bottom-1">
                    <div className="p-1">
                        <button
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); selectMe(); }}
                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <div className="flex items-center gap-2 text-xs text-slate-700">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span>{userName}</span>
                            </div>
                            <CheckCircle className={cn(
                                "w-3.5 h-3.5 text-slate-400 transition-opacity",
                                ownerId === user?.uid ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            )} />
                        </button>

                        <button
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); selectGuest(); }}
                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <User className="w-3.5 h-3.5 text-slate-300" />
                                <span>Guest / Manual</span>
                            </div>
                            {!ownerId && inputValue && (
                                <span className="text-[10px] text-slate-400 uppercase">Typing...</span>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

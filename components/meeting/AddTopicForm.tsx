"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Plus, Clock, BarChart } from "lucide-react";
import { Select } from "../ui/select";

interface AddTopicFormProps {
    onAdd: (topic: { title: string; duration: number; type: any; ownerName: string }) => void;
    disabled?: boolean;
    shouldFocus?: number;
}

export function AddTopicForm({ onAdd, disabled, shouldFocus }: AddTopicFormProps) {
    const [title, setTitle] = useState("");
    const [duration, setDuration] = useState(10);
    const [ownerName, setOwnerName] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (shouldFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [shouldFocus]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        onAdd({
            title,
            duration,
            type: 'discussion', // Default type for quick add
            ownerName: ownerName.trim()
        });
        setTitle("");
        setOwnerName("");
        setDuration(10);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-end gap-6">
                <div className="flex-1 space-y-2 w-full">
                    <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase ml-1">Topic</label>
                    <Input
                        id="title"
                        ref={inputRef}
                        placeholder="e.g., Q4 Strategy Review"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-slate-50/50 border-slate-200 focus:bg-white transition-all h-11"
                        disabled={disabled}
                    />
                </div>

                <div className="w-full md:w-48 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase ml-1">Owner</label>
                    <Input
                        placeholder="Owner name"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="bg-slate-50/50 border-slate-200 focus:bg-white transition-all h-11"
                        disabled={disabled}
                    />
                </div>

                <div className="w-full md:w-24 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase ml-1">Mins</label>
                    <Input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                        className="bg-slate-50/50 border-slate-200 focus:bg-white transition-all h-11"
                        disabled={disabled}
                    />
                </div>

                <Button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-11 rounded-xl font-bold transition-all shadow-lg shadow-slate-900/20"
                    disabled={disabled || !title.trim()}
                >
                    Add
                </Button>
            </form>
        </div>
    );
}

"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Plus, User, Calendar, CheckCircle } from "lucide-react";
import { OwnerPicker } from "./OwnerPicker";

interface ActionItemFormProps {
    onAdd: (title: string, ownerName: string, dueDate: string, ownerId?: string) => void;
    disabled?: boolean;
}

export function ActionItemForm({ onAdd, disabled }: ActionItemFormProps) {
    const [title, setTitle] = useState("");
    const [ownerName, setOwnerName] = useState("");
    const [ownerId, setOwnerId] = useState("");
    const [dueDate, setDueDate] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        onAdd(title.trim(), ownerName.trim(), dueDate, ownerId || undefined);
        setTitle("");
        setOwnerName("");
        setOwnerId("");
        setDueDate("");
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div className="w-full">
                <Input
                    placeholder="What needs to be done?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-white border-slate-200 h-10 text-sm rounded-xl focus-visible:ring-slate-400"
                    disabled={disabled}
                />
            </div>
            <div className="flex items-center gap-2">
                <OwnerPicker
                    value={ownerName}
                    ownerId={ownerId}
                    onSelect={(name: string, id?: string) => {
                        setOwnerName(name);
                        setOwnerId(id || "");
                    }}
                    className="w-44"
                    disabled={disabled}
                />
                <div className="relative w-48">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="pl-10 bg-white border-slate-200 h-10 text-sm rounded-xl flex-row-reverse"
                        disabled={disabled}
                    />
                </div>
                <div className="flex-1"></div>
                <Button
                    type="submit"
                    size="icon"
                    disabled={disabled || !title.trim()}
                    className="h-9 w-9 bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm"
                >
                    <Plus className="w-5 h-5 text-white" />
                </Button>
            </div>
        </form>
    );
}

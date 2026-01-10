"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Plus, Calendar, Target } from "lucide-react";
import { OwnerPicker } from "./OwnerPicker";
import { cn } from "@/lib/utils";

interface DecisionFormProps {
    onAdd: (description: string, ownerName: string, effectiveDate: string, expiryDate?: string, ownerId?: string) => void;
    disabled?: boolean;
}

export function DecisionForm({ onAdd, disabled }: DecisionFormProps) {
    const [description, setDescription] = useState("");
    const [ownerName, setOwnerName] = useState("");
    const [ownerId, setOwnerId] = useState("");
    const [effectiveDate, setEffectiveDate] = useState("");
    const [expiryDate, setExpiryDate] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;
        onAdd(description.trim(), ownerName.trim(), effectiveDate, expiryDate || undefined, ownerId || undefined);
        setDescription("");
        setOwnerName("");
        setOwnerId("");
        setEffectiveDate("");
        setExpiryDate("");
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div className="w-full">
                <Input
                    placeholder="Describe the decision made..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-white border-slate-200 h-10 text-sm rounded-xl focus-visible:ring-slate-400"
                    disabled={disabled}
                />
            </div>
            <div className="flex flex-wrap items-center gap-2">
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

                <div className="relative w-40" title="Effective Date">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600/60" />
                    <Input
                        type="date"
                        value={effectiveDate}
                        onChange={(e) => setEffectiveDate(e.target.value)}
                        className="pl-10 bg-white border-slate-200 h-10 text-sm rounded-xl"
                        placeholder="Effective"
                        disabled={disabled}
                    />
                </div>

                <div className="relative w-40" title="Expiry Date (Optional)">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400/60" />
                    <Input
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="pl-10 bg-white border-slate-200 h-10 text-sm rounded-xl"
                        placeholder="Expires"
                        disabled={disabled}
                    />
                </div>

                <div className="flex-1"></div>
                <Button
                    type="submit"
                    size="icon"
                    disabled={disabled || !description.trim()}
                    className="h-9 w-9 bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm"
                >
                    <Plus className="w-5 h-5 text-white" />
                </Button>
            </div>
        </form>
    );
}

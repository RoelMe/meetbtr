"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Decision } from "../../types";
import { Trash2, User, Calendar, Target, Check } from "lucide-react";
import { OwnerPicker } from "./OwnerPicker";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { format, parseISO, isPast, isToday } from "date-fns";
import { Badge } from "../ui/badge";

interface DecisionListItemProps {
    decision: Decision;
    onUpdate: (id: string, updates: Partial<Decision>) => void;
    onDelete: (id: string) => void;
    disabled?: boolean;
}

export function DecisionListItem({ decision, onUpdate, onDelete, disabled }: DecisionListItemProps) {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = React.useState(false);
    const [editDescription, setEditDescription] = React.useState(decision.description);
    const [editOwner, setEditOwner] = React.useState(decision.ownerName || "");
    const [editOwnerId, setEditOwnerId] = React.useState(decision.ownerId || "");
    const [editEffectiveDate, setEditEffectiveDate] = React.useState(decision.effectiveDate || "");
    const [editExpiryDate, setEditExpiryDate] = React.useState(decision.expiryDate || "");
    const [focusField, setFocusField] = React.useState<'description' | 'owner' | 'effectiveDate' | 'expiryDate'>('description');

    const startEditing = (field: 'description' | 'owner' | 'effectiveDate' | 'expiryDate') => {
        if (disabled) return;
        setFocusField(field);
        setIsEditing(true);
    };

    const handleSave = () => {
        onUpdate(decision.id, {
            description: editDescription,
            ownerName: editOwner,
            ownerId: editOwnerId,
            effectiveDate: editEffectiveDate,
            expiryDate: editExpiryDate
        });
        setIsEditing(false);
    };

    // Calculate status (e.g. if expired)
    const isExpired = decision.expiryDate && isPast(parseISO(decision.expiryDate)) && !isToday(parseISO(decision.expiryDate));

    return (
        <div className="group/item">
            <div className={cn(
                "flex items-start gap-3 py-2 pl-2 pr-0 rounded-xl transition-colors relative hover:bg-slate-50/80"
            )}>
                <div className="pt-1">
                    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-amber-600 bg-amber-50 rounded-lg">
                        <Target className="w-3.5 h-3.5" />
                    </div>
                </div>

                <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                    {isEditing ? (
                        <div className="flex-1 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <input
                                    title="Decision description"
                                    className="flex-1 bg-white border border-slate-200 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSave();
                                        if (e.key === 'Escape') setIsEditing(false);
                                    }}
                                    autoFocus={focusField === 'description'}
                                />
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleSave}
                                        className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    >
                                        <Check className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <OwnerPicker
                                    value={editOwner}
                                    ownerId={editOwnerId}
                                    onSelect={(name, id) => {
                                        setEditOwner(name);
                                        setEditOwnerId(id || "");
                                    }}
                                    className="w-40 h-8"
                                    autoFocus={focusField === 'owner'}
                                />
                                <div className="relative" title="Effective Date">
                                    <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-green-600/60" />
                                    <input
                                        type="date"
                                        className="w-32 bg-white border border-slate-200 rounded pl-6 pr-2 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-slate-400"
                                        value={editEffectiveDate}
                                        onChange={(e) => setEditEffectiveDate(e.target.value)}
                                        autoFocus={focusField === 'effectiveDate'}
                                    />
                                </div>
                                <div className="relative" title="Expiry Date">
                                    <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-red-400/60" />
                                    <input
                                        type="date"
                                        className="w-32 bg-white border border-slate-200 rounded pl-6 pr-2 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-slate-400"
                                        value={editExpiryDate}
                                        onChange={(e) => setEditExpiryDate(e.target.value)}
                                        autoFocus={focusField === 'expiryDate'}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-4">
                                <p
                                    onClick={() => !disabled && startEditing('description')}
                                    className={cn(
                                        "text-sm font-semibold truncate cursor-pointer hover:text-slate-900 transition-colors text-slate-800",
                                        !disabled && "hover:underline underline-offset-2 decoration-slate-200"
                                    )}
                                >
                                    {decision.description}
                                </p>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {decision.ownerName ? (
                                        <Badge
                                            variant="secondary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                !disabled && startEditing('owner');
                                            }}
                                            className={cn(
                                                "bg-slate-100 text-slate-600 border-0 h-5 px-2 text-[10px] font-bold uppercase transition-colors",
                                                !disabled && "cursor-pointer hover:bg-slate-200"
                                            )}
                                        >
                                            <User className="w-2.5 h-2.5 mr-1" />
                                            {decision.ownerName}
                                        </Badge>
                                    ) : (
                                        !disabled && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startEditing('owner');
                                                }}
                                                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase"
                                            >
                                                + Owner
                                            </button>
                                        )
                                    )}

                                    {decision.effectiveDate ? (
                                        <span
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                !disabled && startEditing('effectiveDate');
                                            }}
                                            className={cn(
                                                "flex items-center text-[10px] font-bold px-1.5 h-5 rounded-md flex-shrink-0 transition-colors uppercase text-green-700 bg-green-50",
                                                !disabled && "cursor-pointer hover:bg-green-100"
                                            )}
                                            title="Effective Date"
                                        >
                                            <Calendar className="w-2.5 h-2.5 mr-1" />
                                            {format(parseISO(decision.effectiveDate), "MMM d")}
                                        </span>
                                    ) : (
                                        !disabled && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startEditing('effectiveDate');
                                                }}
                                                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase"
                                            >
                                                + Effective
                                            </button>
                                        )
                                    )}

                                    {decision.expiryDate ? (
                                        <span
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                !disabled && startEditing('expiryDate');
                                            }}
                                            className={cn(
                                                "flex items-center text-[10px] font-bold px-1.5 h-5 rounded-md flex-shrink-0 transition-colors uppercase",
                                                isExpired ? "text-red-700 bg-red-50" : "text-slate-500 bg-slate-100",
                                                !disabled && "cursor-pointer hover:bg-slate-200"
                                            )}
                                            title="Expiry Date"
                                        >
                                            <Calendar className="w-2.5 h-2.5 mr-1" />
                                            {format(parseISO(decision.expiryDate), "MMM d")}
                                        </span>
                                    ) : (
                                        !disabled && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startEditing('expiryDate');
                                                }}
                                                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase"
                                            >
                                                + Expires
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {!disabled && (
                        <div className="absolute -right-[64px] top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity z-50">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(decision.id);
                                }}
                                className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-transparent"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

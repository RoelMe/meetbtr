"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { ActionItem } from "../../types";
import { Check, Trash2, User, Calendar, MessageSquare } from "lucide-react";
import { OwnerPicker } from "./OwnerPicker";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { format, parseISO, isPast, isToday } from "date-fns";
import { Badge } from "../ui/badge";
import { ActionItemComments } from "@/components/comments/ActionItemComments";
import { MentionCandidate } from "@/components/ui/mention-textarea";

interface ActionItemListItemProps {
    item: ActionItem;
    onToggle: (id: string, isCompleted: boolean) => void;
    onUpdate: (id: string, updates: Partial<ActionItem>) => void;
    onDelete: (id: string) => void;
    disabled?: boolean;
    meetingId: string;
    participants?: MentionCandidate[];
}

export function ActionItemListItem({ item, onToggle, onUpdate, onDelete, disabled, meetingId, participants = [] }: ActionItemListItemProps) {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = React.useState(false);
    const [editTitle, setEditTitle] = React.useState(item.title);
    const [editOwner, setEditOwner] = React.useState(item.ownerName || "");
    const [editOwnerId, setEditOwnerId] = React.useState(item.ownerId || "");
    const [editDueDate, setEditDueDate] = React.useState(item.dueDate || "");
    // Keeping editComments for the description/summary field for backward compatibility or high-level status
    const [editComments, setEditComments] = React.useState(item.comments || "");
    const [focusField, setFocusField] = React.useState<'title' | 'owner' | 'date' | 'comments'>('title');

    // Toggle for the threaded comments section
    const [showThread, setShowThread] = React.useState(false);

    const isOverdue = item.dueDate && !item.isCompleted && isPast(parseISO(item.dueDate)) && !isToday(parseISO(item.dueDate));

    const startEditing = (field: 'title' | 'owner' | 'date' | 'comments') => {
        if (disabled) return;
        setFocusField(field);
        setIsEditing(true);
    };

    const handleSave = () => {
        onUpdate(item.id, {
            title: editTitle,
            ownerName: editOwner,
            ownerId: editOwnerId,
            dueDate: editDueDate,
            comments: editComments
        });
        setIsEditing(false);
    };

    return (
        <div className="group/item">
            <div className={cn(
                "flex items-start gap-3 py-2 pl-2 pr-0 rounded-xl transition-colors relative",
                item.isCompleted ? "opacity-60" : "hover:bg-slate-50/80"
            )}>
                <div className="pt-0.5">
                    <button
                        onClick={() => !disabled && onToggle(item.id, !item.isCompleted)}
                        disabled={disabled}
                        className={cn(
                            "flex-shrink-0 w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center",
                            item.isCompleted
                                ? "bg-slate-900 border-slate-900 text-white"
                                : "bg-white border-slate-200 hover:border-slate-400"
                        )}
                    >
                        <Check className={cn("w-3.5 h-3.5 transition-transform", item.isCompleted ? "scale-100" : "scale-0")} />
                    </button>
                </div>

                <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                    {isEditing ? (
                        <div className="flex-1 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <input
                                    title="Action item title"
                                    className="flex-1 bg-white border border-slate-200 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSave();
                                        if (e.key === 'Escape') setIsEditing(false);
                                    }}
                                    autoFocus={focusField === 'title'}
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
                            <div className="flex items-center gap-2">
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
                                <div className="relative">
                                    <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                    <input
                                        title="Action item due date"
                                        type="date"
                                        className="w-32 bg-white border border-slate-200 rounded pl-6 pr-2 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-slate-400"
                                        value={editDueDate}
                                        onChange={(e) => setEditDueDate(e.target.value)}
                                        autoFocus={focusField === 'date'}
                                    />
                                </div>
                            </div>
                            <div className="relative mt-1">
                                <MessageSquare className="absolute left-2 top-2 w-3 h-3 text-slate-400" />
                                <textarea
                                    title="Progress comments"
                                    className="w-full bg-white border border-slate-200 rounded pl-6 pr-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-slate-400 min-h-[60px] resize-none"
                                    value={editComments}
                                    onChange={(e) => setEditComments(e.target.value)}
                                    placeholder="High-level status summary..."
                                    autoFocus={focusField === 'comments'}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-4">
                                <p
                                    onClick={() => startEditing('title')}
                                    className={cn(
                                        "text-sm font-semibold truncate cursor-pointer hover:text-slate-900 transition-colors uppercase tracking-tight",
                                        item.isCompleted ? "text-slate-400 line-through font-normal" : "text-slate-800"
                                    )}
                                >
                                    {item.title}
                                </p>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => setShowThread(!showThread)}
                                        className={cn(
                                            "p-1 rounded transition-colors flex items-center gap-1.5",
                                            showThread ? "text-slate-900 bg-slate-100" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                        )}
                                        title="Discussion Thread"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        {/* Ideally show comment count here if we fetched it, but we only fetch inside usage */}
                                    </button>

                                    {item.ownerName ? (
                                        <Badge
                                            variant="secondary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startEditing('owner');
                                            }}
                                            className="bg-slate-100 text-slate-600 border-0 h-5 px-2 text-[10px] font-bold cursor-pointer hover:bg-slate-200 transition-colors uppercase"
                                        >
                                            <User className="w-2.5 h-2.5 mr-1" />
                                            {item.ownerName}
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
                                                + Assign
                                            </button>
                                        )
                                    )}
                                    {item.dueDate ? (
                                        <span
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startEditing('date');
                                            }}
                                            className={cn(
                                                "flex items-center text-[10px] font-bold px-1.5 h-5 rounded-md flex-shrink-0 cursor-pointer transition-colors uppercase",
                                                isOverdue ? "text-slate-900 bg-slate-200 hover:bg-slate-300" : "text-slate-400 bg-slate-50 hover:bg-slate-100"
                                            )}
                                        >
                                            <Calendar className="w-2.5 h-2.5 mr-1" />
                                            {format(parseISO(item.dueDate), "MMM d")}
                                        </span>
                                    ) : (
                                        !disabled && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startEditing('date');
                                                }}
                                                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase"
                                            >
                                                + Date
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Static status/summary if present */}
                            {item.comments && (
                                <div
                                    onClick={() => startEditing('comments')}
                                    className="mt-1 flex items-start gap-1.5 text-[11px] text-slate-500 cursor-pointer hover:text-slate-700"
                                >
                                    <p className="leading-relaxed line-clamp-1 truncate italic">
                                        Status: {item.comments}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {!disabled && (
                        <div className="absolute -right-[64px] top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity z-50">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(item.id);
                                }}
                                className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-transparent"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Threaded Comments Section */}
            {showThread && (
                <div className="pl-10 pr-2 pt-2 pb-4 animate-in fade-in slide-in-from-top-1">
                    <ActionItemComments
                        meetingId={meetingId}
                        actionItemId={item.id}
                        participants={participants}
                    />
                </div>
            )}
        </div>
    );
}

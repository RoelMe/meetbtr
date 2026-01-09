"use client";

import React from "react";
import { ActionItem } from "@/types";
import { Check, Trash2, User, Calendar, ExternalLink, Pencil, X, MoreVertical, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "../ui/button";
import { format, parseISO, isPast, isToday } from "date-fns";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ActionItemComments } from "@/components/comments/ActionItemComments";
import { MentionCandidate } from "@/components/ui/mention-textarea";

interface ActionItemRowProps {
    item: ActionItem;
}

export function ActionItemRow({ item }: ActionItemRowProps) {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = React.useState(false);

    // Permission check
    const canEdit = user?.uid === item.ownerId || user?.uid === item.meetingOwnerId;

    // Edit state
    const [editTitle, setEditTitle] = React.useState(item.title);
    const [editOwner, setEditOwner] = React.useState(item.ownerName || "");
    const [editDueDate, setEditDueDate] = React.useState(item.dueDate || "");
    const [editComments, setEditComments] = React.useState(item.comments || "");

    // Thread toggle
    const [showThread, setShowThread] = React.useState(false);

    const isOverdue = item.dueDate && !item.isCompleted && isPast(parseISO(item.dueDate)) && !isToday(parseISO(item.dueDate));

    // Construct participants for mentions (approximate for dashboard context)
    const participants: MentionCandidate[] = React.useMemo(() => {
        const p: MentionCandidate[] = [];
        if (user && user.uid) {
            p.push({ id: user.uid, name: user.displayName || "Me" });
        }
        if (item.ownerId && item.ownerName && item.ownerId !== user?.uid) {
            p.push({ id: item.ownerId, name: item.ownerName });
        }
        // Add meeting owner if known and different
        // item.meetingOwnerId is available, but we might not have the name if it's not the current user or task owner.
        // We'll rely on what we have.
        return p;
    }, [user, item.ownerId, item.ownerName]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const ref = doc(db, "meetings", item.meetingId, "actionItems", item.id);
        await updateDoc(ref, { isCompleted: !item.isCompleted });
    };

    const handleDelete = async () => {
        if (confirm("Delete this action item?")) {
            const ref = doc(db, "meetings", item.meetingId, "actionItems", item.id);
            await deleteDoc(ref);
        }
    };

    const handleUpdate = async () => {
        const ref = doc(db, "meetings", item.meetingId, "actionItems", item.id);
        await updateDoc(ref, {
            title: editTitle,
            ownerName: editOwner,
            dueDate: editDueDate,
            comments: editComments
        });
        setIsEditing(false);
    };

    const cancelEditing = () => {
        setEditTitle(item.title);
        setEditOwner(item.ownerName || "");
        setEditDueDate(item.dueDate || "");
        setEditComments(item.comments || "");
        setIsEditing(false);
    };

    return (
        <>
            <tr className={cn(
                "group transition-all hover:bg-slate-50 border-b border-slate-100 last:border-0",
                item.isCompleted && !isEditing && "opacity-60",
                isEditing && "bg-slate-50",
                isOverdue && !item.isCompleted && "bg-red-50/50",
                showThread && "bg-slate-50 border-b-0"
            )}>
                {/* Status Column */}
                <td className="py-3 pl-4 pr-1 w-10 align-top">
                    <button
                        onClick={handleToggle}
                        disabled={isEditing || !canEdit}
                        className={cn(
                            "w-4 h-4 rounded border transition-all flex items-center justify-center",
                            item.isCompleted
                                ? "bg-slate-900 border-slate-900 text-white"
                                : "bg-white border-slate-200 hover:border-slate-400",
                            (isEditing || !canEdit) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <Check className={cn("w-2.5 h-2.5 transition-transform", item.isCompleted ? "scale-100" : "scale-0")} />
                    </button>
                </td>

                {/* Task Title Column */}
                <td className="py-3 px-3 align-top min-w-[200px] max-w-[400px]">
                    {isEditing ? (
                        <input
                            title="Edit task title"
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdate();
                                if (e.key === 'Escape') cancelEditing();
                            }}
                            autoFocus
                        />
                    ) : (
                        <div className="flex items-start gap-2">
                            <h4
                                onClick={() => canEdit && setIsEditing(true)}
                                className={cn(
                                    "text-xs font-semibold truncate cursor-pointer transition-colors flex-1",
                                    item.isCompleted
                                        ? "text-slate-400 line-through"
                                        : isOverdue
                                            ? "text-red-600 hover:text-red-700"
                                            : "text-slate-600 hover:text-slate-900"
                                )}
                                title={item.title}
                            >
                                {item.title}
                            </h4>
                            <button
                                onClick={() => setShowThread(!showThread)}
                                className={cn(
                                    "p-0.5 rounded transition-colors flex-shrink-0",
                                    showThread ? "text-blue-600 bg-blue-50" : "text-slate-300 hover:text-slate-500 hover:bg-slate-100"
                                )}
                            >
                                <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </td>

                {/* Meeting Column */}
                <td className="py-3 px-3 align-top w-40 max-w-[160px]">
                    <div className={cn(
                        "flex items-center text-xs font-medium tracking-tight truncate",
                        item.isCompleted ? "text-slate-400" : "text-slate-600"
                    )}>
                        <Link
                            href={`/meeting/${item.meetingId}?topic=${item.topicId}`}
                            className="hover:text-slate-900 transition-colors flex items-center gap-1 truncate"
                            title={item.meetingTitle}
                        >
                            {item.meetingTitle}
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </Link>
                    </div>
                </td>

                {/* Topic Column */}
                <td className="py-3 px-3 align-top w-40 max-w-[160px]">
                    <div className={cn(
                        "text-xs font-medium tracking-tight truncate",
                        item.isCompleted ? "text-slate-400" : "text-slate-600"
                    )} title={item.topicTitle}>
                        {item.topicTitle}
                    </div>
                </td>

                {/* Updates Column */}
                <td className="py-3 px-3 align-top min-w-[200px] max-w-[400px]">
                    {isEditing ? (
                        <textarea
                            title="Edit updates"
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-slate-400/20 min-h-[40px] resize-none"
                            value={editComments}
                            onChange={(e) => setEditComments(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleUpdate();
                                if (e.key === 'Escape') cancelEditing();
                            }}
                            placeholder="Add progress updates..."
                        />
                    ) : (
                        <p className={cn(
                            "text-xs italic truncate leading-relaxed",
                            item.isCompleted ? "text-slate-400" : "text-slate-600"
                        )} title={item.comments || "No updates yet"}>
                            {item.comments || "No updates yet"}
                        </p>
                    )}
                </td>

                {/* Owner Column */}
                <td className="py-3 px-3 align-top w-32">
                    {isEditing ? (
                        <div className="relative">
                            <User className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                            <input
                                title="Edit assignee"
                                className="w-full bg-white border border-slate-200 rounded pl-6 pr-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                                value={editOwner}
                                onChange={(e) => setEditOwner(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleUpdate();
                                    if (e.key === 'Escape') cancelEditing();
                                }}
                                placeholder="Assignee"
                            />
                        </div>
                    ) : (
                        item.ownerName && (
                            <div className={cn(
                                "flex items-center text-xs font-medium truncate",
                                item.isCompleted ? "text-slate-400" : "text-slate-600"
                            )}>
                                <User className="w-2.5 h-2.5 mr-1 shrink-0 text-slate-400" />
                                <span className="truncate">{item.ownerName}</span>
                            </div>
                        )
                    )}
                </td>

                {/* Meeting Date Column */}
                <td className="py-3 px-3 align-top w-44">
                    <div className={cn(
                        "text-xs font-medium tracking-tight",
                        item.isCompleted ? "text-slate-400" : "text-slate-600"
                    )}>
                        {format(parseISO(item.meetingScheduledAt || item.createdAt), "dd/MM/yy")}
                    </div>
                </td>

                {/* Due Date Column */}
                <td className="py-3 px-3 align-top w-28">
                    {isEditing ? (
                        <input
                            title="Edit due date"
                            type="date"
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdate();
                                if (e.key === 'Escape') cancelEditing();
                            }}
                        />
                    ) : (
                        item.dueDate && (
                            <div className={cn(
                                "text-xs font-medium tracking-tight",
                                item.isCompleted ? "text-slate-400" : (isOverdue ? "text-red-600" : "text-slate-600")
                            )}>
                                {format(parseISO(item.dueDate), "dd/MM/yy")}
                            </div>
                        )
                    )}
                </td>

                {/* Actions Column */}
                <td className="py-3 pl-2 pr-4 align-top text-right w-10">
                    {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                            <button
                                onClick={handleUpdate}
                                className="p-1 text-slate-900 hover:bg-slate-100 rounded transition-colors"
                                title="Save"
                            >
                                <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={cancelEditing}
                                className="p-1 text-slate-400 hover:bg-slate-50 rounded transition-colors"
                                title="Cancel"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ) : (
                        canEdit && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors opacity-0 group-hover:opacity-100">
                                        <MoreVertical className="w-3.5 h-3.5" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-24">
                                    <DropdownMenuItem onClick={() => setIsEditing(true)} className="text-[11px] font-medium cursor-pointer">
                                        <Pencil className="w-3 h-3 mr-2" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleDelete} className="text-[11px] font-medium cursor-pointer">
                                        <Trash2 className="w-3 h-3 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )
                    )}
                </td>
            </tr>
            {showThread && (
                <tr className="bg-slate-50 border-b border-slate-100 animate-in fade-in slide-in-from-top-1">
                    <td colSpan={9} className="px-4 pb-4 pt-0">
                        <div className="pl-12">
                            <ActionItemComments
                                meetingId={item.meetingId}
                                actionItemId={item.id}
                                participants={participants}
                            />
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

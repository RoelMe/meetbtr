import React, { useState } from "react";
import { Comment } from "../../types";
import { formatDistanceToNow } from "date-fns";
import { User, MoreHorizontal, Trash2, Edit2, CornerDownRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MentionTextarea, MentionCandidate } from "@/components/ui/mention-textarea";

interface CommentItemProps {
    comment: Comment;
    onDelete: (id: string) => void;
    onEdit: (id: string, content: string, mentions: string[]) => void;
    onReply?: (authorName: string) => void;
    candidates: MentionCandidate[];
}

export function CommentItem({ comment, onDelete, onEdit, onReply, candidates }: CommentItemProps) {
    const { user } = useAuth();
    const isOwner = user?.uid === comment.authorId;
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(comment.content);

    const handleSaveEdit = () => {
        // Extract mentions (simplified logic: find @Name)
        // Ideally we pass strict IDs but for now simple string matching on save is okay
        const mentions: string[] = [];
        candidates.forEach(c => {
            if (editValue.includes(`@${c.name}`)) {
                mentions.push(c.id);
            }
        });

        onEdit(comment.id, editValue, mentions);
        setIsEditing(false);
    };

    // Format content to highlight mentions
    const renderContent = (content: string) => {
        // Regex to find @Name or @First Last
        // Matches @ followed by word chars, optionally followed by space and another word
        const parts = content.split(/(@[\w\u00C0-\u00FF]+(?:\s[\w\u00C0-\u00FF]+)?)/g);
        return parts.map((part, i) => {
            if (part.startsWith("@")) {
                const name = part.substring(1).trim();
                // Optional: Strictly check against candidates if available
                // const isCandidate = candidates.some(c => c.name === name);
                // if (!isCandidate) return part;

                return <span key={i} className="text-blue-600 font-semibold bg-blue-50 rounded px-1 box-decoration-clone">{part}</span>;
            }
            return part;
        });
    };

    return (
        <div className="group flex gap-3 py-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                    <span className="text-xs font-bold text-slate-500">
                        {comment.authorName.charAt(0).toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                            {comment.authorName}
                        </span>
                        <span className="text-xs text-slate-400">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                    </div>

                    {isOwner && !isEditing && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"
                                >
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                    <Edit2 className="w-3.5 h-3.5 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDelete(comment.id)} className="text-red-600 focus:text-red-600">
                                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {isEditing ? (
                    <div className="space-y-2">
                        <MentionTextarea
                            value={editValue}
                            onValueChange={setEditValue}
                            candidates={candidates}
                            className="min-h-[80px]"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {renderContent(comment.content)}
                    </div>
                )}
            </div>
        </div>
    );
}

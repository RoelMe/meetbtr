import React, { useState } from "react";
import { useComments } from "@/hooks/useComments";
import { CommentList } from "./CommentList";
import { MentionTextarea, MentionCandidate } from "@/components/ui/mention-textarea";
import { Button } from "@/components/ui/button";
import { Send, X } from "lucide-react";

interface ActionItemCommentsProps {
    meetingId: string;
    actionItemId: string;
    participants: MentionCandidate[]; // List of potential mentions
}

export function ActionItemComments({ meetingId, actionItemId, participants }: ActionItemCommentsProps) {
    const { comments, loading, addComment, deleteComment, updateComment } = useComments(meetingId, actionItemId);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // Auto-open input if no comments exist
    React.useEffect(() => {
        if (!loading && comments.length === 0) {
            setIsAdding(true);
        }
    }, [loading, comments.length]);

    const handleSubmit = async () => {
        if (!newComment.trim()) return;
        setIsSubmitting(true);

        // Extract mentions (simplified)
        const mentions: string[] = [];
        participants.forEach(p => {
            if (newComment.includes(`@${p.name}`)) {
                mentions.push(p.id);
            }
        });

        await addComment(newComment, mentions);
        setNewComment("");
        setIsSubmitting(false);
    };

    if (loading) {
        return <div className="p-4 text-center text-xs text-slate-400">Loading comments...</div>;
    }

    return (
        <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-4 space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Comments & Updates</h4>

            <CommentList
                comments={comments}
                onDelete={deleteComment}
                onEdit={updateComment}
                candidates={participants}
            />

            <div className="pt-2">
                {!isAdding ? (
                    <Button
                        variant="ghost"
                        onClick={() => setIsAdding(true)}
                        className="text-primary hover:bg-slate-100 hover:text-primary px-2 h-8 text-xs font-semibold"
                    >
                        <span className="text-lg mr-1">+</span> comment
                    </Button>
                ) : (
                    <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex gap-3 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex-1">
                                <MentionTextarea
                                    value={newComment}
                                    onValueChange={setNewComment}
                                    candidates={participants}
                                    placeholder="Type a comment... Use @ to mention someone."
                                    minHeight="min-h-[80px]"
                                    className="text-sm border-0 focus:ring-0"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit();
                                        }
                                        if (e.key === 'Escape') {
                                            setIsAdding(false);
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2 p-1">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!newComment.trim() || isSubmitting}
                                    size="icon"
                                    className="h-8 w-8 shrink-0 text-primary hover:bg-slate-100 bg-transparent shadow-none border border-slate-100"
                                    title="Send"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                                <Button
                                    onClick={() => setIsAdding(false)}
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 shrink-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                    title="Cancel"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 pl-1">
                            Tip: Press Enter to send, Shift+Enter for new line. Mention people using @name. Esc to cancel.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

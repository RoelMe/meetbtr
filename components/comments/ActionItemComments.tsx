import React, { useState } from "react";
import { useComments } from "@/hooks/useComments";
import { CommentList } from "./CommentList";
import { MentionTextarea, MentionCandidate } from "@/components/ui/mention-textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ActionItemCommentsProps {
    meetingId: string;
    actionItemId: string;
    participants: MentionCandidate[]; // List of potential mentions
}

export function ActionItemComments({ meetingId, actionItemId, participants }: ActionItemCommentsProps) {
    const { comments, loading, addComment, deleteComment, updateComment } = useComments(meetingId, actionItemId);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

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

            <div className="flex gap-3 pt-2">
                <div className="flex-1">
                    <MentionTextarea
                        value={newComment}
                        onValueChange={setNewComment}
                        candidates={participants}
                        placeholder="Type a comment... Use @ to mention someone."
                        minHeight="min-h-[80px]"
                        className="text-sm shadow-sm"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                    />
                </div>
                <Button
                    onClick={handleSubmit}
                    disabled={!newComment.trim() || isSubmitting}
                    size="icon"
                    className="h-10 w-10 shrink-0 bg-slate-900 hover:bg-slate-800"
                >
                    <Send className="w-4 h-4 text-white" />
                </Button>
            </div>
            <p className="text-[10px] text-slate-400 pl-1">
                Tip: Press Enter to send, Shift+Enter for new line. Mention people using @name.
            </p>
        </div>
    );
}

import React from "react";
import { Comment } from "../../types";
import { CommentItem } from "./CommentItem";
import { MentionCandidate } from "@/components/ui/mention-textarea";

interface CommentListProps {
    comments: Comment[];
    onDelete: (id: string) => void;
    onEdit: (id: string, content: string, mentions: string[]) => void;
    candidates: MentionCandidate[];
}

export function CommentList({ comments, onDelete, onEdit, candidates }: CommentListProps) {
    if (comments.length === 0) {
        return null;
    }

    return (
        <div className="space-y-1 divide-y divide-slate-50">
            {comments.map((comment) => (
                <CommentItem
                    key={comment.id}
                    comment={comment}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    candidates={candidates}
                />
            ))}
        </div>
    );
}

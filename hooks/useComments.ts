import { useState, useEffect } from "react";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    doc,
    deleteDoc,
    updateDoc
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Comment } from "../types";
import { useAuth } from "./useAuth";

export function useComments(meetingId: string, actionItemId: string) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!meetingId || !actionItemId) return;

        const commentsRef = collection(db, "meetings", meetingId, "actionItems", actionItemId, "comments");
        const q = query(commentsRef, orderBy("createdAt", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Comment));
            setComments(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [meetingId, actionItemId]);

    const addComment = async (content: string, mentions: string[] = []) => {
        if (!user || !meetingId || !actionItemId) return;

        const commentsRef = collection(db, "meetings", meetingId, "actionItems", actionItemId, "comments");

        await addDoc(commentsRef, {
            content,
            authorId: user.uid,
            authorName: user.displayName || user.email?.split('@')[0] || "Unknown",
            createdAt: new Date().toISOString(), // Use ISO for easier client sorting/display consistency
            mentions,
            actionItemId
        });
    };

    const deleteComment = async (commentId: string) => {
        if (!meetingId || !actionItemId) return;
        const commentRef = doc(db, "meetings", meetingId, "actionItems", actionItemId, "comments", commentId);
        await deleteDoc(commentRef);
    };

    // Edit functionality could be added here
    const updateComment = async (commentId: string, content: string, mentions: string[]) => {
        if (!meetingId || !actionItemId) return;
        const commentRef = doc(db, "meetings", meetingId, "actionItems", actionItemId, "comments", commentId);
        await updateDoc(commentRef, {
            content,
            mentions,
            updatedAt: new Date().toISOString()
        });
    };

    return { comments, loading, addComment, deleteComment, updateComment };
}

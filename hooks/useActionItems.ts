"use client";

import { useState, useEffect } from "react";
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    where
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { ActionItem } from "../types";

export function useActionItems(meetingId: string, topicId: string) {
    const [actionItems, setActionItems] = useState<ActionItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!meetingId || !topicId) return;

        const actionItemsRef = collection(db, "meetings", meetingId, "actionItems");
        const q = query(
            actionItemsRef,
            where("topicId", "==", topicId),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ActionItem));
            setActionItems(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [meetingId, topicId]);

    const addActionItem = async (
        title: string,
        ownerName: string,
        dueDate: string,
        meetingTitle: string,
        topicTitle: string,
        privateMeetingOwnerId?: string,
        ownerId?: string,
        meetingScheduledAt?: string
    ) => {
        const actionItemsRef = collection(db, "meetings", meetingId, "actionItems");
        await addDoc(actionItemsRef, {
            meetingId,
            topicId,
            meetingOwnerId: privateMeetingOwnerId || null,
            meetingTitle,
            topicTitle,
            title,
            ownerName,
            ownerId: ownerId || null,
            dueDate,
            meetingScheduledAt: meetingScheduledAt || null,
            isCompleted: false,
            createdAt: new Date().toISOString()
        });
    };

    const toggleActionItem = async (actionId: string, isCompleted: boolean) => {
        const actionItemRef = doc(db, "meetings", meetingId, "actionItems", actionId);
        await updateDoc(actionItemRef, { isCompleted });
    };

    const deleteActionItem = async (actionId: string) => {
        const actionItemRef = doc(db, "meetings", meetingId, "actionItems", actionId);
        await deleteDoc(actionItemRef);
    };

    const updateActionItem = async (actionId: string, updates: Partial<ActionItem>) => {
        const actionItemRef = doc(db, "meetings", meetingId, "actionItems", actionId);
        await updateDoc(actionItemRef, updates);
    };

    return { actionItems, loading, addActionItem, toggleActionItem, deleteActionItem, updateActionItem };
}

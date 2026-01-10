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
import { Decision } from "../types";

export function useDecisions(meetingId: string, topicId: string) {
    const [decisions, setDecisions] = useState<Decision[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!meetingId || !topicId) return;

        const decisionsRef = collection(db, "meetings", meetingId, "decisions");
        const q = query(
            decisionsRef,
            where("topicId", "==", topicId),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Decision));
            setDecisions(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [meetingId, topicId]);

    const addDecision = async (
        description: string,
        ownerName: string,
        effectiveDate: string,
        meetingTitle: string,
        topicTitle: string,
        privateMeetingOwnerId?: string,
        ownerId?: string,
        expiryDate?: string
    ) => {
        const decisionsRef = collection(db, "meetings", meetingId, "decisions");
        await addDoc(decisionsRef, {
            meetingId,
            topicId,
            meetingOwnerId: privateMeetingOwnerId || null,
            meetingTitle,
            topicTitle,
            description,
            ownerName,
            ownerId: ownerId || null,
            effectiveDate,
            expiryDate: expiryDate || null,
            createdAt: new Date().toISOString()
        });
    };

    const deleteDecision = async (decisionId: string) => {
        const decisionRef = doc(db, "meetings", meetingId, "decisions", decisionId);
        await deleteDoc(decisionRef);
    };

    const updateDecision = async (decisionId: string, updates: Partial<Decision>) => {
        const decisionRef = doc(db, "meetings", meetingId, "decisions", decisionId);
        await updateDoc(decisionRef, updates);
    };

    return { decisions, loading, addDecision, deleteDecision, updateDecision };
}

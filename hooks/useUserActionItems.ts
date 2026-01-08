"use client";

import { useState, useEffect } from "react";
import {
    collectionGroup,
    query,
    where,
    onSnapshot,
    orderBy,
    or
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { ActionItem } from "../types";

export function useUserActionItems(userId: string | undefined) {
    const [actionItems, setActionItems] = useState<ActionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!userId) {
            setActionItems([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        // Fetch action items where the user is either the assigned owner
        // OR the owner of the meeting the item belongs to.
        const q = query(
            collectionGroup(db, "actionItems"),
            or(
                where("ownerId", "==", userId),
                where("meetingOwnerId", "==", userId)
            ),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const items = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as ActionItem[];

                // Filter items the user actually has access to
                // For now, these are items where the user is either the meeting owner 
                // OR the ownerId of the action item itself.
                // In a real app, we'd use Firestore security rules to only return 
                // what they can see, but collectionGroup rules are complex.
                setActionItems(items);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching global action items:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [userId]);

    return { actionItems, loading, error };
}

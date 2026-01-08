import { useState, useEffect } from "react";
import { doc, collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Meeting, Topic } from "../types";

export function useMeeting(meetingId: string) {
    const [meeting, setMeeting] = useState<Meeting | null>(null);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!meetingId) return;

        // 1. Subscribe to Meeting Document
        const meetingRef = doc(db, "meetings", meetingId);
        const unsubscribeMeeting = onSnapshot(
            meetingRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    setMeeting({ id: docSnap.id, ...docSnap.data() } as Meeting);
                } else {
                    setError(new Error("Meeting not found"));
                }
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching meeting:", err);
                setError(err);
                setLoading(false);
            }
        );

        // 2. Subscribe to Topics Sub-collection
        const topicsRef = collection(db, "meetings", meetingId, "topics");
        const topicsQuery = query(topicsRef, where("isDeleted", "==", false));
        const unsubscribeTopics = onSnapshot(
            topicsQuery,
            (querySnap) => {
                const topicsData = querySnap.docs.map(
                    (doc) => ({ id: doc.id, ...doc.data() } as Topic)
                );
                setTopics(topicsData);
            },
            (err) => {
                console.error("Error fetching topics:", err);
            }
        );

        return () => {
            unsubscribeMeeting();
            unsubscribeTopics();
        };
    }, [meetingId]);

    return { meeting, topics, loading, error };
}

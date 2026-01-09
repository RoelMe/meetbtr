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
                    const data = docSnap.data();
                    // Helper to safely convert Firestore timestamps to ISO strings
                    const convertTimestamp = (ts: any) => {
                        try {
                            return ts?.toDate?.().toISOString() || ts || new Date().toISOString();
                        } catch (e) {
                            return new Date().toISOString();
                        }
                    };

                    const safeScheduledAt = convertTimestamp(data.scheduledAt || data.createdAt);

                    setMeeting({
                        id: docSnap.id,
                        ...data,
                        scheduledAt: safeScheduledAt,
                        createdAt: convertTimestamp(data.createdAt),
                        startedAt: data.startedAt ? convertTimestamp(data.startedAt) : null,
                        scheduledDuration: Number(data.scheduledDuration) || 60, // Ensure it's a number, default to 60
                        topicOrder: data.topicOrder || [],
                        status: data.status || 'planning',
                        timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                    } as Meeting);
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
                // Re-declare helper or move it outside if possible, but inside effect is fine
                const convertTimestamp = (ts: any) => ts?.toDate?.().toISOString() || ts;

                const topicsData = querySnap.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: convertTimestamp(data.createdAt),
                        completedAt: convertTimestamp(data.completedAt)
                    } as Topic;
                });
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

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Meeting, Topic } from '../types';

interface AdjacentMeeting {
    meeting: Meeting;
    topics: Topic[];
}

interface UseMeetingSeriesResult {
    previous: AdjacentMeeting | null;
    next: AdjacentMeeting | null;
    loading: boolean;
}

export function useMeetingSeries(currentMeeting: Meeting): UseMeetingSeriesResult {
    const [previous, setPrevious] = useState<AdjacentMeeting | null>(null);
    const [next, setNext] = useState<AdjacentMeeting | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Only proceed if it's a recurring meeting with a seriesId
        if (!currentMeeting?.recurrence?.seriesId) {
            setPrevious(null);
            setNext(null);
            return;
        }

        const fetchAdjacent = async () => {
            setLoading(true);
            try {
                const seriesId = currentMeeting.recurrence!.seriesId;
                const currentScheduledAt = currentMeeting.scheduledAt;

                // Fetch ALL meetings in the series (optimization: depending on series size, this might be fine for < 50 items)
                // If series is huge, we should specific queries for < and > scheduledAt.
                // Since we have a hard limit of 50, fetching all is okay.

                const meetingsRef = collection(db, 'meetings');
                const q = query(
                    meetingsRef,
                    where('recurrence.seriesId', '==', seriesId),
                    where('ownerId', '==', currentMeeting.ownerId),
                    orderBy('scheduledAt', 'asc')
                );

                const snapshot = await getDocs(q);
                const allMeetings = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Meeting));

                // Find current meeting index
                const currentIndex = allMeetings.findIndex(m => m.id === currentMeeting.id);

                if (currentIndex === -1) return;

                // Get Prev
                if (currentIndex > 0) {
                    const prevMeeting = allMeetings[currentIndex - 1];
                    const prevTopicsRef = collection(db, 'meetings', prevMeeting.id, 'topics');
                    const prevTopicsSnapshot = await getDocs(prevTopicsRef);
                    const prevTopics = prevTopicsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Topic));
                    setPrevious({ meeting: prevMeeting, topics: prevTopics });
                } else {
                    setPrevious(null);
                }

                // Get Next
                if (currentIndex < allMeetings.length - 1) {
                    const nextMeeting = allMeetings[currentIndex + 1];
                    const nextTopicsRef = collection(db, 'meetings', nextMeeting.id, 'topics');
                    const nextTopicsSnapshot = await getDocs(nextTopicsRef);
                    const nextTopics = nextTopicsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Topic));
                    setNext({ meeting: nextMeeting, topics: nextTopics });
                } else {
                    setNext(null);
                }

            } catch (error) {
                console.error("Error fetching meeting series:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdjacent();
    }, [currentMeeting?.id, currentMeeting?.recurrence?.seriesId, currentMeeting?.scheduledAt]);

    return { previous, next, loading };
}

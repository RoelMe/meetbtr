import { useState, useEffect } from 'react';
import {
    collection,
    query,
    where,
    onSnapshot,
    orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Meeting } from '../types';

export function useUserMeetings(userId: string | undefined) {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!userId) {
            setMeetings([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const q = query(
            collection(db, 'meetings'),
            where('ownerId', '==', userId),
            where('isDeleted', '==', false),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const meetingsData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Meeting[];

                setMeetings(meetingsData);
                setLoading(false);
            },
            (err) => {
                console.error('Error fetching meetings:', err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [userId]);

    return { meetings, loading, error };
}

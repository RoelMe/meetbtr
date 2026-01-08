"use client";

import { useState, useEffect, useMemo } from "react";
import { addSeconds, differenceInSeconds } from "date-fns";
import { Meeting, Topic } from "../types";

export interface TimerState {
    activeTopicId: string | null;
    secondsRemaining: number | null;
    isOvertime: boolean;
}

/**
 * Hook to calculate current meeting state based on the start time and topic durations.
 */
export function useMeetingTimer(meeting: Meeting | null, topics: Topic[]): TimerState {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    return useMemo(() => {
        if (!meeting || !meeting.startedAt || meeting.status !== 'running' || topics.length === 0) {
            return { activeTopicId: null, secondsRemaining: null, isOvertime: false };
        }

        // Helper to parse Firestore Timestamp or ISO string
        const toDate = (ts: any) => {
            if (!ts) return null;
            if (typeof ts === 'object' && 'toDate' in ts) return ts.toDate();
            if (typeof ts === 'object' && 'seconds' in ts) return new Date(ts.seconds * 1000);
            return new Date(ts);
        };

        const meetingStartedAt = toDate(meeting.startedAt);
        if (!meetingStartedAt || isNaN(meetingStartedAt.getTime())) {
            return { activeTopicId: null, secondsRemaining: null, isOvertime: false };
        }

        const topicMap = new Map(topics.map(t => [t.id, t]));
        const orderedTopics = meeting.topicOrder
            .map(id => topicMap.get(id))
            .filter((t): t is Topic => !!t && !t.isDeleted);

        // Find the first topic that is not completed
        const activeIndex = orderedTopics.findIndex(t => !t.isCompleted);

        // If all topics are completed, stay on the last one (it will show as completed anyway)
        if (activeIndex === -1) {
            return { activeTopicId: null, secondsRemaining: null, isOvertime: false };
        }

        const activeTopic = orderedTopics[activeIndex];

        // Determine when this active topic "started"
        // It's either when the meeting started (if it's the first one)
        // or when the previous topic was completed.
        let startTime: Date;
        if (activeIndex === 0) {
            startTime = meetingStartedAt;
        } else {
            const previousTopic = orderedTopics[activeIndex - 1];
            const prevCompletedAt = toDate(previousTopic.completedAt);
            startTime = prevCompletedAt || meetingStartedAt; // Fallback to meeting start if somehow missing
        }

        const durationSeconds = activeTopic.duration * 60;
        const elapsedSinceStart = differenceInSeconds(now, startTime);
        const secondsRemaining = durationSeconds - elapsedSinceStart;

        return {
            activeTopicId: activeTopic.id,
            secondsRemaining: secondsRemaining,
            isOvertime: secondsRemaining < 0
        };
    }, [now, meeting, topics]);
}

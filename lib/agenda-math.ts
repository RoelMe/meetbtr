import { addMinutes, format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { Topic } from "../types";

export interface CalculatedTopic extends Topic {
    startTime: Date;
    endTime: Date;
}

/**
 * Calculates start and end times for each topic based on the meeting start time and topic durations.
 */
export function calculateTopicTimes(
    meetingStart: Date,
    topics: Topic[],
    topicOrder: string[]
): CalculatedTopic[] {
    // Map topics for easy lookup
    const topicMap = new Map(topics.map((t) => [t.id, t]));

    let currentStartTime = meetingStart;

    return topicOrder
        .map((id) => topicMap.get(id))
        .filter((t): t is Topic => !!t)
        .map((topic) => {
            const startTime = currentStartTime;
            const endTime = addMinutes(startTime, topic.duration);
            currentStartTime = endTime;

            return {
                ...topic,
                startTime,
                endTime,
            };
        });
}

/**
 * Formats a date for display in a specific timezone.
 */
export function formatTopicTime(date: Date, timezone: string): string {
    try {
        return formatInTimeZone(date, timezone, "HH:mm");
    } catch (error) {
        console.error("Error formatting time:", error);
        return format(date, "HH:mm");
    }
}

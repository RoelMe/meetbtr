import { NextRequest, NextResponse } from "next/server";
import { createEvents, EventAttributes } from "ics";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Meeting, Topic } from "@/types";

export async function POST(req: NextRequest) {
    try {
        const meeting = await req.json() as Meeting;

        // Robust Date Parsing helper
        const parseDate = (dateVal: any): Date => {
            if (!dateVal) return new Date();
            // Handle Firestore Timestamp object { seconds, nanoseconds }
            if (typeof dateVal === 'object' && 'seconds' in dateVal) {
                return new Date(dateVal.seconds * 1000);
            }
            // Handle ISO string or other date formats
            const d = new Date(dateVal);
            return isNaN(d.getTime()) ? new Date() : d;
        };

        const startDate = parseDate(meeting.scheduledAt);
        const topicIds = Array.isArray(meeting.topicOrder) ? meeting.topicOrder : [];

        // Fetch topics for this meeting to build the description
        let sortedTopics: Topic[] = [];
        try {
            const topicsRef = collection(db, "meetings", meeting.id, "topics");
            const topicsSnapshot = await getDocs(topicsRef);
            const topics = topicsSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Topic))
                .filter(t => !t.isDeleted);

            // Sort topics according to meeting.topicOrder
            sortedTopics = topicIds
                .map(id => topics.find(t => t.id === id))
                .filter((t): t is Topic => !!t);
        } catch (e) {
            console.warn("Could not fetch topics for calendar export:", e);
        }

        // Build description from agenda items
        const description = sortedTopics.length > 0
            ? "Agenda:\n" + sortedTopics.map((t, i) =>
                `${i + 1}. ${t.title} (${t.duration}m)${t.ownerName ? ` - ${t.ownerName}` : ""}`
            ).join("\n")
            : "No agenda topics defined yet.";

        const durationMinutes = meeting.scheduledDuration || 60;

        const event: EventAttributes = {
            start: [
                startDate.getUTCFullYear(),
                startDate.getUTCMonth() + 1,
                startDate.getUTCDate(),
                startDate.getUTCHours(),
                startDate.getUTCMinutes()
            ],
            duration: { minutes: durationMinutes },
            title: meeting.title || "Untitled Meeting",
            description: description,
            status: "CONFIRMED",
            busyStatus: "BUSY",
            url: `${req.nextUrl.origin}/meeting/${meeting.id}`
        };

        const { error, value } = createEvents([event]);

        if (error) {
            console.error("ICS Library Error:", error);
            throw error;
        }

        return new NextResponse(value, {
            headers: {
                "Content-Type": "text/calendar",
                "Content-Disposition": `attachment; filename="${(meeting.title || 'meeting').replace(/\s+/g, "_")}.ics"`,
            },
        });
    } catch (error) {
        console.error("Calendar export error:", error);
        return NextResponse.json({
            error: "Failed to generate calendar file",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

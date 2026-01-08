"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserMeetings } from "@/hooks/useUserMeetings";
import { useUserActionItems } from "@/hooks/useUserActionItems";
import { MeetingsView } from "@/components/dashboard/MeetingsView";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Meeting } from "@/types";

export default function MeetingsPage() {
    const { user } = useAuth();
    const { meetings, loading: meetingsLoading } = useUserMeetings(user?.uid);
    const { actionItems, loading: actionsLoading } = useUserActionItems(user?.uid);

    const loading = meetingsLoading || actionsLoading;

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this meeting?")) {
            await updateDoc(doc(db, "meetings", id), { isDeleted: true });
        }
    };

    const handleArchive = async (id: string) => {
        await updateDoc(doc(db, "meetings", id), {
            status: "ended",
            isArchived: true
        });
    };

    const handleExport = async (meeting: Meeting) => {
        try {
            const response = await fetch("/api/calendar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(meeting),
            });
            if (!response.ok) throw new Error("Failed to generate calendar file");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${meeting.title.replace(/\s+/g, "_")}.ics`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export error:", error);
            alert("Failed to export meeting to calendar.");
        }
    };

    return (
        <MeetingsView
            meetings={meetings}
            actionItems={actionItems}
            loading={loading}
            onDelete={handleDelete}
            onArchive={handleArchive}
            onExport={handleExport}
        />
    );
}

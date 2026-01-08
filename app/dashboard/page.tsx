"use client";

import { ActionItemsTable } from "@/components/dashboard/ActionItemsTable";
import { MeetingCard } from "@/components/dashboard/MeetingCard";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useUserActionItems } from "@/hooks/useUserActionItems";
import { useUserMeetings } from "@/hooks/useUserMeetings";
import { db } from "@/lib/firebase";
import { Meeting } from "@/types";
import { isPast, isThisWeek, isToday, parseISO } from "date-fns";
import { doc, updateDoc } from "firebase/firestore";
import { Calendar, ListTodo, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";

export default function DashboardOverview() {
    const { user, loading: authLoading, signInWithGoogle } = useAuth();
    const { meetings, loading: meetingsLoading } = useUserMeetings(user?.uid);
    const { actionItems, loading: actionsLoading } = useUserActionItems(user?.uid);
    const [timeFilter, setTimeFilter] = useState("week");

    // Meetings management logic (needed for MeetingCard)
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
        }
    };

    const upcomingMeetings = useMemo(() => {
        const now = new Date();
        const baseFiltered = meetings
            .filter((m) => {
                const startTime = new Date(m.scheduledAt);
                const endTime = new Date(startTime.getTime() + (m.scheduledDuration || 60) * 60000);
                return endTime > now;
            })
            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

        if (timeFilter === "today") {
            return baseFiltered.filter(m => isToday(parseISO(m.scheduledAt)));
        } else if (timeFilter === "week") {
            return baseFiltered.filter(m => isThisWeek(parseISO(m.scheduledAt), { weekStartsOn: 1 }));
        } else if (timeFilter === "later") {
            return baseFiltered.filter(m => !isThisWeek(parseISO(m.scheduledAt), { weekStartsOn: 1 }));
        }
        return baseFiltered;
    }, [meetings, timeFilter]);

    const myActionItems = useMemo(() => {
        return actionItems
            .filter(item => item.ownerId === user?.uid && !item.isCompleted)
            .sort((a, b) => {
                const now = new Date();
                const aDue = a.dueDate ? parseISO(a.dueDate) : null;
                const bDue = b.dueDate ? parseISO(b.dueDate) : null;

                const aOverdue = aDue && isPast(aDue) && !isToday(aDue);
                const bOverdue = bDue && isPast(bDue) && !isToday(bDue);

                if (aOverdue && !bOverdue) return -1;
                if (!aOverdue && bOverdue) return 1;

                if (!aDue) return 1;
                if (!bDue) return -1;
                return aDue.getTime() - bDue.getTime();
            });
    }, [actionItems, user]);

    if (authLoading || meetingsLoading || actionsLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    <p className="text-slate-500 font-medium tracking-wide">Gathering your agendas...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 text-center space-y-6">
                    <div className="h-16 w-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <span className="text-3xl">👋</span>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
                        <p className="text-slate-500 font-medium">Sign in to access your dashboard and meetings.</p>
                    </div>

                    <Button
                        onClick={async () => {
                            try {
                                await signInWithGoogle();
                            } catch (e) {
                                // Error handled in AuthProvider
                            }
                        }}
                        className="w-full h-14 text-lg font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-500/20"
                    >
                        Sign in with Google
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 pt-4 pb-12 space-y-16">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-4 lowercase">Overview</h1>
                    <p className="text-slate-500 font-medium">
                        Welcome back! Here&apos;s what&apos;s on your agenda for today and your most urgent tasks.
                    </p>
                </div>
                <SearchInput
                    placeholder="Search"
                    wrapperClassName="max-w-md w-full"
                />
            </div>

            {/* Upcoming Meetings Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-gray-900" />
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight lowercase">upcoming meetings</h2>
                    </div>
                    <Link href="/dashboard/meetings" className="text-sm font-bold text-slate-400 hover:text-gray-900 transition-colors uppercase tracking-widest">
                        View All
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <Tabs value={timeFilter} onValueChange={setTimeFilter} className="w-auto">
                        <TabsList className="bg-white border border-gray-200 p-1 rounded-xl shadow-sm h-auto flex gap-1">
                            <TabsTrigger
                                value="today"
                                className="h-9 px-4 rounded-lg text-xs font-bold data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-none text-slate-500 hover:bg-gray-50 hover:text-gray-900 transition-all"
                            >
                                Today
                            </TabsTrigger>
                            <TabsTrigger
                                value="week"
                                className="h-9 px-4 rounded-lg text-xs font-bold data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-none text-slate-500 hover:bg-gray-50 hover:text-gray-900 transition-all"
                            >
                                This Week
                            </TabsTrigger>
                            <TabsTrigger
                                value="later"
                                className="h-9 px-4 rounded-lg text-xs font-bold data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-none text-slate-500 hover:bg-gray-50 hover:text-gray-900 transition-all"
                            >
                                Later
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <Link href="/">
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm h-11 px-4 rounded-xl transition-all font-bold text-xs">
                            <Plus className="mr-2 h-4 w-4" /> new meeting
                        </Button>
                    </Link>
                </div>

                {upcomingMeetings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {upcomingMeetings.map((meeting) => (
                            <MeetingCard
                                key={meeting.id}
                                meeting={meeting}
                                onDelete={handleDelete}
                                onArchive={handleArchive}
                                onExport={handleExport}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">no upcoming meetings</h3>
                        <p className="text-slate-500 mb-8 font-medium">your schedule is clear. ready to plan something new?</p>
                        <Link href="/">
                            <Button variant="outline" className="border-gray-200 h-11 rounded-xl font-bold">
                                create an agenda
                            </Button>
                        </Link>
                    </div>
                )}
            </section>

            {/* My Action Items Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ListTodo className="w-6 h-6 text-gray-900" />
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight lowercase">my actions</h2>
                    </div>
                    <Link href="/dashboard/actions" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">
                        View All Tasks
                    </Link>
                </div>

                <ActionItemsTable
                    actionItems={myActionItems}
                    loading={false}
                    variant="overview"
                    title="" // Hide title in overview section
                    description="Your pending tasks, prioritized by due date."
                />
            </section>
        </div>
    );
}

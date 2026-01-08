import { ActionItem, Meeting } from "@/types";
import { cn } from "@/lib/utils";
import Fuse from "fuse.js";
import { Calendar as CalendarIcon, FolderOpen, LayoutGrid, Loader2, Plus, Search } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { SearchInput } from "../ui/search-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { CalendarView } from "./CalendarView";
import { MeetingCard } from "./MeetingCard";

interface MeetingsViewProps {
    meetings: Meeting[];
    actionItems?: ActionItem[];
    loading: boolean;
    onDelete: (id: string) => Promise<void>;
    onArchive: (id: string) => Promise<void>;
    onExport: (meeting: Meeting) => Promise<void>;
}

export function MeetingsView({
    meetings,
    actionItems = [],
    loading,
    onDelete,
    onArchive,
    onExport
}: MeetingsViewProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [view, setView] = useState<'grid' | 'calendar'>('grid');

    const fuse = useMemo(() => {
        return new Fuse(meetings, {
            keys: [
                { name: "title", weight: 0.6 },
                { name: "searchKeywords", weight: 0.4 }
            ],
            threshold: 0.35,
            distance: 2000,
            ignoreLocation: true,
            minMatchCharLength: 2,
        });
    }, [meetings]);

    const filteredMeetings = useMemo(() => {
        if (!searchQuery) return meetings;
        return fuse.search(searchQuery).map((result) => result.item);
    }, [searchQuery, fuse, meetings]);

    const allSortedMeetings = useMemo(() => {
        return [...filteredMeetings].sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
    }, [filteredMeetings]);

    const upcomingMeetings = useMemo(() => {
        const now = new Date();
        return filteredMeetings
            .filter((m) => {
                const startTime = new Date(m.scheduledAt);
                const endTime = new Date(startTime.getTime() + (m.scheduledDuration || 60) * 60000);
                return endTime > now;
            })
            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    }, [filteredMeetings]);

    const pastMeetings = useMemo(() => {
        const now = new Date();
        return filteredMeetings
            .filter((m) => {
                const startTime = new Date(m.scheduledAt);
                const endTime = new Date(startTime.getTime() + (m.scheduledDuration || 60) * 60000);
                return endTime <= now;
            })
            .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
    }, [filteredMeetings]);

    return (
        <div className="container mx-auto px-4 overflow-hidden md:overflow-visible pt-4 pb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-4 lowercase">My Meetings</h1>
                    <p className="text-slate-500 font-medium">Manage your upcoming and past agendas.</p>
                </div>
                <SearchInput
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    wrapperClassName="max-w-md w-full"
                />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <Tabs defaultValue="upcoming" className="w-full">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <TabsList className="bg-white border border-gray-200 p-1 rounded-xl shadow-sm h-auto flex gap-1">
                            <TabsTrigger
                                value="upcoming"
                                className="h-9 px-4 rounded-lg text-xs font-bold data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-none text-slate-500 hover:bg-gray-50 hover:text-gray-900 transition-all"
                            >
                                Upcoming ({upcomingMeetings.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="all"
                                className="h-9 px-4 rounded-lg text-xs font-bold data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-none text-slate-500 hover:bg-gray-50 hover:text-gray-900 transition-all"
                            >
                                All ({allSortedMeetings.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="past"
                                className="h-9 px-4 rounded-lg text-xs font-bold data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-none text-slate-500 hover:bg-gray-50 hover:text-gray-900 transition-all"
                            >
                                Past ({pastMeetings.length})
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-white border border-gray-200 p-1 rounded-xl shadow-sm gap-1">
                                <Button
                                    variant={view === 'grid' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setView('grid')}
                                    className={cn(
                                        "h-9 px-4 rounded-lg flex items-center gap-2 transition-all",
                                        view === 'grid' ? "bg-gray-100 text-gray-900 shadow-none" : "text-slate-500 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                    <span className="text-xs font-bold">List</span>
                                </Button>
                                <Button
                                    variant={view === 'calendar' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setView('calendar')}
                                    className={cn(
                                        "h-9 px-4 rounded-lg flex items-center gap-2 transition-all",
                                        view === 'calendar' ? "bg-gray-100 text-gray-900 shadow-none" : "text-slate-500 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <CalendarIcon className="w-4 h-4" />
                                    <span className="text-xs font-bold">Calendar</span>
                                </Button>
                            </div>

                            <Link href="/">
                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm h-11 px-4 rounded-xl transition-all font-bold text-xs">
                                    <Plus className="mr-2 h-4 w-4" /> new meeting
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-20 text-center">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">Gathering your agendas...</p>
                        </div>
                    ) : view === 'grid' ? (
                        <>
                            <TabsContent value="upcoming" className="mt-8">
                                {upcomingMeetings.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {upcomingMeetings.map((meeting) => (
                                            <MeetingCard
                                                key={meeting.id}
                                                meeting={meeting}
                                                onDelete={onDelete}
                                                onArchive={onArchive}
                                                onExport={onExport}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                                            <CalendarIcon className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">No upcoming meetings</h3>
                                        <p className="text-slate-500 mb-8">Ready to plan your next session?</p>
                                        <Link href="/">
                                            <Button variant="outline" className="border-gray-200 h-11 rounded-xl">
                                                Create your first agenda
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="all" className="mt-8">
                                {allSortedMeetings.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {allSortedMeetings.map((meeting) => (
                                            <MeetingCard
                                                key={meeting.id}
                                                meeting={meeting}
                                                onDelete={onDelete}
                                                onArchive={onArchive}
                                                onExport={onExport}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                                            <CalendarIcon className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">No meetings found</h3>
                                        <p className="text-slate-500 mb-8">Create your first meeting to get started.</p>
                                        <Link href="/">
                                            <Button variant="outline" className="border-gray-200 h-11 rounded-xl">
                                                Create your first agenda
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="past" className="mt-8">
                                {pastMeetings.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {pastMeetings.map((meeting) => (
                                            <MeetingCard
                                                key={meeting.id}
                                                meeting={meeting}
                                                onDelete={onDelete}
                                                onArchive={onArchive}
                                                onExport={onExport}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                                            <FolderOpen className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">No archived meetings</h3>
                                        <p className="text-slate-500 font-medium">Completed meetings will appear here after they end.</p>
                                    </div>
                                )}
                            </TabsContent>
                        </>
                    ) : (
                        <div className="mt-6">
                            <CalendarView
                                meetings={filteredMeetings}
                                actionItems={actionItems}
                            />
                        </div>
                    )}
                </Tabs>
            </div>
        </div>
    );
}

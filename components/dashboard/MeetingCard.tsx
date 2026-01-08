"use client";

import React from "react";
import { format } from "date-fns";
import {
    Calendar,
    Clock,
    MoreHorizontal,
    Share2,
    Trash2,
    Archive,
    CalendarPlus,
    ArrowRight
} from "lucide-react";
import { Meeting } from "../../types";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MeetingCardProps {
    meeting: Meeting;
    onDelete: (id: string) => void;
    onArchive: (id: string) => void;
    onExport: (meeting: Meeting) => void;
}

export function MeetingCard({ meeting, onDelete, onArchive, onExport }: MeetingCardProps) {
    const startDate = new Date(meeting.scheduledAt);
    const endDate = new Date(startDate.getTime() + (meeting.scheduledDuration || 60) * 60000);
    const formattedDate = format(startDate, "EEE, MMM do");
    const formattedTime = `${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`;

    const statusColors = {
        planning: "bg-blue-100 text-blue-700 border-blue-200",
        running: "bg-emerald-100 text-emerald-700 border-emerald-200 animate-pulse",
        ended: "bg-slate-100 text-slate-700 border-slate-200",
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/meeting/${meeting.id}`;
        navigator.clipboard.writeText(url);
        // You might want to use a toast here
        alert("Link copied to clipboard!");
    };

    return (
        <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200 overflow-hidden bg-white">
            <CardContent className="p-0">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <Badge
                            variant="outline"
                            className={cn("capitalize px-2 py-0.5 text-[10px] font-bold tracking-wider", statusColors[meeting.status])}
                        >
                            {meeting.status}
                        </Badge>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Share Link
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onExport(meeting)} className="cursor-pointer">
                                    <CalendarPlus className="mr-2 h-4 w-4" />
                                    Add to Calendar
                                </DropdownMenuItem>
                                {meeting.status !== 'ended' && (
                                    <DropdownMenuItem onClick={() => onArchive(meeting.id)} className="cursor-pointer">
                                        <Archive className="mr-2 h-4 w-4" />
                                        Archive Meeting
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onDelete(meeting.id)}
                                    className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <Link href={`/meeting/${meeting.id}`} className="block group/link">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover/link:text-blue-600 transition-colors line-clamp-1">
                            {meeting.title}
                        </h3>

                        <div className="space-y-2">
                            <div className="flex items-center text-slate-500 text-sm">
                                <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                                <span>{formattedDate}</span>
                            </div>
                            <div className="flex items-center text-slate-500 text-sm">
                                <Clock className="mr-2 h-4 w-4 text-slate-400" />
                                <span>{formattedTime}</span>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-between items-center group-hover:bg-slate-100/50 transition-colors">
                    <span className="text-xs font-medium text-slate-500">
                        {meeting.topicOrder.length} {meeting.topicOrder.length === 1 ? 'topic' : 'topics'}
                    </span>
                    <Link
                        href={`/meeting/${meeting.id}`}
                        className="text-xs font-bold text-primary flex items-center hover:underline"
                    >
                        Open Workspace <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

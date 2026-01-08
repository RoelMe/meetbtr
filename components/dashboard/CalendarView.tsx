"use client";

import React, { useState, useMemo } from "react";
import {
    format,
    addMonths,
    subMonths,
    addWeeks,
    subWeeks,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ListTodo, LayoutGrid, List, Check } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Meeting, ActionItem } from "@/types";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface CalendarViewProps {
    meetings: Meeting[];
    actionItems?: ActionItem[];
}

const WEEK_OPTIONS = { weekStartsOn: 1 as const };
const HOUR_HEIGHT = 48;

export function CalendarView({ meetings, actionItems = [] }: CalendarViewProps) {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'week'>('month');
    const [now, setNow] = useState(new Date());

    // Update "now" every minute
    React.useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const days = useMemo(() => {
        if (view === 'month') {
            const start = startOfWeek(startOfMonth(currentDate), WEEK_OPTIONS);
            const end = endOfWeek(endOfMonth(currentDate), WEEK_OPTIONS);
            return eachDayOfInterval({ start, end });
        } else {
            const start = startOfWeek(currentDate, WEEK_OPTIONS);
            const end = endOfWeek(currentDate, WEEK_OPTIONS);
            return eachDayOfInterval({ start, end });
        }
    }, [currentDate, view]);

    const nextInterval = () => setCurrentDate(view === 'month' ? addMonths(currentDate, 1) : addWeeks(currentDate, 1));
    const prevInterval = () => setCurrentDate(view === 'month' ? subMonths(currentDate, 1) : subWeeks(currentDate, 1));

    const getItemsForDay = (day: Date) => {
        const dayMeetings = meetings.filter((meeting) => {
            const dateVal = meeting.scheduledAt as any;
            const meetingDate = dateVal && typeof dateVal === 'object' && 'seconds' in dateVal
                ? new Date(dateVal.seconds * 1000)
                : parseISO(dateVal);
            return isSameDay(meetingDate, day);
        }).map(m => {
            const startTime = (() => {
                const dateVal = m.scheduledAt as any;
                return dateVal && typeof dateVal === 'object' && 'seconds' in dateVal
                    ? new Date(dateVal.seconds * 1000)
                    : parseISO(dateVal);
            })();
            const endTime = new Date(startTime.getTime() + (m.scheduledDuration || 60) * 60000);
            return { ...m, type: 'meeting' as const, sortTime: startTime.getTime(), startTime, endTime };
        });

        const dayActions = actionItems
            .filter(item => item.ownerId === user?.uid)
            .filter((item) => {
                const dueDate = parseISO(item.dueDate);
                return isSameDay(dueDate, day);
            }).map(a => ({ ...a, type: 'action' as const, sortTime: parseISO(a.dueDate).getTime() }));

        return [...dayMeetings, ...dayActions].sort((a, b) => a.sortTime - b.sortTime);
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900 border border-slate-100">
                        <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {format(currentDate, "MMMM yyyy")}
                        </h2>
                        {view === 'week' && (
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Week of {format(startOfWeek(currentDate), "MMM d")} - {format(endOfWeek(currentDate), "MMM d")}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentDate(new Date())}
                        className="text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-transparent px-2"
                    >
                        Today
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl text-xs h-9 px-4 gap-2 border-slate-200 bg-white hover:bg-slate-50 shadow-sm"
                            >
                                <span className="capitalize font-semibold text-slate-700">{view}</span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400 rotate-90" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 p-1 rounded-xl shadow-xl border-slate-200">
                            <DropdownMenuItem
                                onClick={() => setView('month')}
                                className={cn(
                                    "rounded-lg text-xs py-2 px-3 flex items-center justify-between cursor-pointer",
                                    view === 'month' ? "bg-slate-50 font-bold text-slate-900" : "text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                <span>Month</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setView('week')}
                                className={cn(
                                    "rounded-lg text-xs py-2 px-3 flex items-center justify-between cursor-pointer",
                                    view === 'week' ? "bg-slate-50 font-bold text-slate-900" : "text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                <span>Week</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={prevInterval}
                            className="w-9 h-9 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={nextInterval}
                            className="w-9 h-9 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Calendar Body */}
            <div className="p-4 md:p-6 overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Weekdays Header */}
                    <div className={cn(
                        "grid mb-4 border-b border-slate-100 pb-2",
                        view === 'month' ? "grid-cols-7" : "grid-cols-[60px_repeat(7,1fr)]"
                    )}>
                        {view === 'week' && <div />}
                        {(view === 'month' ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : days).map((day, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "text-center text-[10px] font-bold uppercase tracking-wider",
                                    view === 'week' && isToday(day as Date) ? "text-blue-600" : "text-slate-400"
                                )}
                            >
                                {view === 'month' ? day as string : (
                                    <div className="flex items-center justify-center gap-1.5">
                                        <span>{format(day as Date, "EEE")}</span>
                                        <span className={cn(
                                            "w-6 h-6 flex items-center justify-center rounded-lg",
                                            isToday(day as Date) ? "bg-blue-600 text-white shadow-sm" : "text-slate-900"
                                        )}>
                                            {format(day as Date, "d")}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {view === 'month' ? (
                        /* Month Grid */
                        <div className="grid grid-cols-7 border-t border-l border-slate-100">
                            {days.map((day, idx) => {
                                const isCurrentMonth = isSameMonth(day, currentDate);

                                return (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "min-h-[100px] md:min-h-[140px] p-2 border-r border-b border-slate-100 transition-colors",
                                            !isCurrentMonth ? "bg-slate-50/50" : "bg-white",
                                            isToday(day) && "bg-blue-50/30"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span
                                                className={cn(
                                                    "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg",
                                                    isToday(day)
                                                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                                        : isCurrentMonth
                                                            ? "text-slate-900"
                                                            : "text-slate-300"
                                                )}
                                            >
                                                {format(day, "d")}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            {getItemsForDay(day).map((item) => (
                                                item.type === 'meeting' ? (
                                                    <Link
                                                        key={item.id}
                                                        href={`/meeting/${item.id}`}
                                                        className={cn(
                                                            "block p-1.5 rounded-lg text-[10px] font-semibold transition-all border",
                                                            item.status === "ended"
                                                                ? "bg-slate-50 text-slate-500 border-slate-100"
                                                                : "bg-blue-50 text-blue-700 border-blue-100 hover:border-blue-300 hover:shadow-sm"
                                                        )}
                                                        title={item.title}
                                                    >
                                                        <div className="truncate">{item.title}</div>
                                                        <div className="text-[8px] opacity-70 mt-0.5">
                                                            {format(item.startTime, "h:mm a")} - {format(item.endTime, "h:mm a")}
                                                        </div>
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        key={item.id}
                                                        href={`/meeting/${item.meetingId}?topic=${item.topicId}`}
                                                        className={cn(
                                                            "flex items-center gap-1.5 p-1.5 rounded-lg text-[10px] font-semibold transition-all border bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300 hover:shadow-sm",
                                                            item.isCompleted && "opacity-60"
                                                        )}
                                                        title={`Task: ${item.title}`}
                                                    >
                                                        <ListTodo className="w-3 h-3 shrink-0 text-slate-400" />
                                                        <div className="truncate">{item.title}</div>
                                                    </Link>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Week Time-Grid */
                        <div className="relative border-t border-slate-100">
                            {/* Time Axis and Grid Background */}
                            <div className="flex">
                                {/* Hour Labels Column */}
                                <div className="w-[60px] flex-shrink-0 border-r border-slate-100">
                                    {/* Spacer for All-Day Area Alignment */}
                                    <div className="h-[40px] border-b border-slate-100" />
                                    {Array.from({ length: 24 }).map((_, i) => (
                                        <div key={i} className="h-12 relative">
                                            <span className="absolute -top-2 right-2 text-[10px] font-bold text-slate-400 uppercase">
                                                {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Day Columns Grid */}
                                <div className="flex-1 grid grid-cols-7 relative">
                                    {days.map((day, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "border-r border-slate-100 min-h-[1152px] relative",
                                                isToday(day) && "bg-blue-50/20"
                                            )}
                                        >
                                            {/* All-Day Items Area */}
                                            <div className="h-[40px] border-b border-slate-100 p-1 space-y-1 overflow-y-auto">
                                                {getItemsForDay(day).filter(i => i.type === 'action').map((item: any) => (
                                                    <Link
                                                        key={item.id}
                                                        href={`/meeting/${item.meetingId}?topic=${item.topicId}`}
                                                        className={cn(
                                                            "flex items-center gap-1.5 p-1 rounded-lg text-[9px] font-semibold transition-all border bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:shadow-sm",
                                                            item.isCompleted && "opacity-60"
                                                        )}
                                                        title={`Task: ${item.title}`}
                                                    >
                                                        <ListTodo className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                                                        <div className="truncate">{item.title}</div>
                                                    </Link>
                                                ))}
                                            </div>

                                            {/* Time Grid Wrapper */}
                                            <div className="relative">
                                                {/* Vertical Hour Markers Grid Lines */}
                                                {Array.from({ length: 24 }).map((_, i) => (
                                                    <div key={i} className="h-12 border-b border-slate-100/50" />
                                                ))}

                                                {/* Items for this day */}
                                                {getItemsForDay(day).map((item) => {
                                                    if (item.type !== 'meeting') return null;
                                                    const startMins = item.startTime.getHours() * 60 + item.startTime.getMinutes();
                                                    const durationMins = (item.endTime.getTime() - item.startTime.getTime()) / 60000;
                                                    const top = (startMins / 60) * HOUR_HEIGHT;
                                                    const height = (durationMins / 60) * HOUR_HEIGHT;

                                                    return (
                                                        <Link
                                                            key={item.id}
                                                            href={`/meeting/${item.id}`}
                                                            style={{ top: `${top}px`, height: `${height}px` }}
                                                            className={cn(
                                                                "absolute left-1 right-1 p-2 rounded-xl text-[10px] font-semibold transition-all border shadow-sm flex flex-col justify-between overflow-hidden group/item",
                                                                item.status === "ended"
                                                                    ? "bg-slate-50 text-slate-500 border-slate-100"
                                                                    : "bg-blue-50 text-blue-700 border-blue-100 hover:border-blue-300 hover:shadow-md z-10"
                                                            )}
                                                            title={item.title}
                                                        >
                                                            <div className="flex flex-col gap-0.5">
                                                                <div className="truncate group-hover/item:whitespace-normal">{item.title}</div>
                                                                <div className="text-[8px] opacity-70">
                                                                    {format(item.startTime, "h:mm a")} - {format(item.endTime, "h:mm a")}
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Now Indicator */}
                                    {(() => {
                                        const todayIdx = days.findIndex(d => isToday(d));
                                        if (todayIdx === -1) return null;

                                        const nowMins = now.getHours() * 60 + now.getMinutes();
                                        const top = (nowMins / 60) * HOUR_HEIGHT;

                                        return (
                                            <div
                                                className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                                                style={{ top: `${top}px` }}
                                            >
                                                <div className="absolute left-[-65px] bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                                                    {format(now, "h:mm a")}
                                                </div>
                                                <div className="w-full border-t-2 border-slate-900/40"></div>
                                                <div
                                                    className="absolute w-2.5 h-2.5 bg-slate-900 rounded-full border-2 border-white shadow-sm"
                                                    style={{ left: `${(todayIdx / 7) * 100 + (1 / 14) * 100}%`, transform: 'translateX(-50%)' }}
                                                />
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

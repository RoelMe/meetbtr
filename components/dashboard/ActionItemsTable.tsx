"use client";

import React, { useState, useMemo } from "react";
import { ActionItem } from "@/types";
import { ActionItemRow } from "./ActionItemRow";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Search, ListTodo, Calendar, ArrowUp, ArrowDown, Filter, Loader2 } from "lucide-react";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";

interface ActionItemsTableProps {
    actionItems: ActionItem[];
    loading: boolean;
    variant?: "default" | "overview";
    title?: string;
    description?: string;
}

export function ActionItemsTable({
    actionItems,
    loading,
    variant = "default",
    title = "Action Items",
    description = "Manage your tasks across all meetings."
}: ActionItemsTableProps) {
    // Filters & Sorting
    const [actionStatus, setActionStatus] = useState<'all' | 'open' | 'completed'>('all');
    const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
    const [selectedMeetings, setSelectedMeetings] = useState<string[]>([]);
    const [meetingDateRange, setMeetingDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
    const [dueDateRange, setDueDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
    const [actionDatePreset, setActionDatePreset] = useState<'all' | 'overdue' | 'today'>('all');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const filteredActions = useMemo(() => {
        let result = actionItems.filter(item => {
            // Status Filter
            if (actionStatus === 'open' && item.isCompleted) return false;
            if (actionStatus === 'completed' && !item.isCompleted) return false;

            // Owner Filter
            if (selectedOwners.length > 0 && !selectedOwners.includes(item.ownerName)) return false;

            // Meeting Filter
            if (selectedMeetings.length > 0 && !selectedMeetings.includes(item.meetingTitle)) return false;

            // Date Filters
            if (meetingDateRange.start || meetingDateRange.end) {
                const itemDate = parseISO(item.meetingScheduledAt || item.createdAt);
                if (meetingDateRange.start && itemDate < startOfDay(parseISO(meetingDateRange.start))) return false;
                if (meetingDateRange.end && itemDate > endOfDay(parseISO(meetingDateRange.end))) return false;
            }

            const now = new Date();
            const due = item.dueDate ? parseISO(item.dueDate) : null;

            if (actionDatePreset === 'overdue') {
                if (!due || item.isCompleted || (due >= now || due.toDateString() === now.toDateString())) return false;
            } else if (actionDatePreset === 'today') {
                if (!due || due.toDateString() !== now.toDateString()) return false;
            } else if (dueDateRange.start || dueDateRange.end) {
                if (!due) return false;
                if (dueDateRange.start && due < startOfDay(parseISO(dueDateRange.start))) return false;
                if (dueDateRange.end && due > endOfDay(parseISO(dueDateRange.end))) return false;
            }

            return true;
        });

        // Sorting
        if (sortConfig) {
            result = [...result].sort((a: any, b: any) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];
                if (sortConfig.key === 'meetingDate') {
                    aValue = a.meetingScheduledAt || a.createdAt;
                    bValue = b.meetingScheduledAt || b.createdAt;
                }
                if (!aValue) return 1;
                if (!bValue) return -1;
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [actionItems, actionStatus, selectedOwners, selectedMeetings, meetingDateRange, dueDateRange, actionDatePreset, sortConfig]);

    const allOwners = useMemo(() => Array.from(new Set(actionItems.map(item => item.ownerName).filter(Boolean))), [actionItems]);
    const allMeetingTitles = useMemo(() => Array.from(new Set(actionItems.map(item => item.meetingTitle).filter(Boolean))), [actionItems]);

    const handleSort = (key: string) => {
        setSortConfig(current => {
            if (current?.key === key) {
                if (current.direction === 'asc') return { key, direction: 'desc' };
                return null;
            }
            return { key, direction: 'asc' };
        });
    };

    return (
        <div className="flex flex-col gap-6">
            {(title || description) && (
                <div className="flex flex-col gap-2">
                    {title && <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-4 lowercase">{title}</h1>}
                    {description && <p className="text-slate-500 font-medium">{description}</p>}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
                <div className="bg-white p-1 rounded-xl border border-gray-200 flex gap-1">
                    <Button
                        variant={actionStatus === 'all' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setActionStatus('all')}
                        className={cn("h-8 rounded-lg text-xs font-bold hover:bg-gray-50 hover:text-gray-900", actionStatus === 'all' && "bg-gray-100")}
                    >All</Button>
                    <Button
                        variant={actionStatus === 'open' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setActionStatus('open')}
                        className={cn("h-8 rounded-lg text-xs font-bold hover:bg-gray-50 hover:text-gray-900", actionStatus === 'open' && "bg-gray-100")}
                    >Open</Button>
                    <Button
                        variant={actionStatus === 'completed' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setActionStatus('completed')}
                        className={cn("h-8 rounded-lg text-xs font-bold hover:bg-gray-50 hover:text-gray-900", actionStatus === 'completed' && "bg-gray-100")}
                    >Completed</Button>
                </div>

                <div className="bg-white p-1 rounded-xl border border-gray-200 flex gap-1">
                    <Button
                        variant={actionDatePreset === 'all' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setActionDatePreset('all')}
                        className={cn("h-8 rounded-lg text-xs font-bold hover:bg-gray-50 hover:text-gray-900", actionDatePreset === 'all' && "bg-gray-100")}
                    >Any Date</Button>
                    <Button
                        variant={actionDatePreset === 'overdue' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setActionDatePreset('overdue')}
                        className={cn("h-8 rounded-lg text-xs font-bold hover:bg-gray-50 hover:text-gray-900", actionDatePreset === 'overdue' && "bg-gray-100")}
                    >Overdue</Button>
                    <Button
                        variant={actionDatePreset === 'today' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setActionDatePreset('today')}
                        className={cn("h-8 rounded-lg text-xs font-bold hover:bg-gray-50 hover:text-gray-900", actionDatePreset === 'today' && "bg-gray-100")}
                    >Today</Button>
                </div>

                {(selectedOwners.length > 0 || selectedMeetings.length > 0 || meetingDateRange.start || meetingDateRange.end || dueDateRange.start || dueDateRange.end) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSelectedOwners([]);
                            setSelectedMeetings([]);
                            setMeetingDateRange({ start: "", end: "" });
                            setDueDateRange({ start: "", end: "" });
                            setActionDatePreset('all');
                        }}
                        className="h-8 text-xs font-medium text-slate-500 hover:text-gray-900"
                    >
                        Clear All Filters
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Finding your tasks...</p>
                </div>
            ) : filteredActions.length > 0 ? (
                <div className="bg-white border-y border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-200">
                                    <th className="py-3 pl-4 pr-1 text-left w-10"></th>
                                    <th className="py-3 px-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest leading-none min-w-[200px] max-w-[400px]">
                                        <button onClick={() => handleSort('title')} className="flex items-center gap-1 hover:text-gray-600 transition-colors">
                                            Task
                                            {sortConfig?.key === 'title' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : null}
                                        </button>
                                    </th>
                                    <th className="py-3 px-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest leading-none w-44">
                                        <div className="flex items-center justify-between gap-1">
                                            <button onClick={() => handleSort('meetingTitle')} className="flex items-center gap-1 hover:text-gray-600 transition-colors">
                                                Meeting
                                                {sortConfig?.key === 'meetingTitle' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : null}
                                            </button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className={cn("p-0.5 rounded hover:bg-gray-200 transition-colors", selectedMeetings.length > 0 && "text-gray-900")}>
                                                        <Filter className="w-3 h-3" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start" className="w-56 max-h-[300px] overflow-y-auto">
                                                    <DropdownMenuLabel className="text-xs">Filter by Meeting</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    {allMeetingTitles.map(title => (
                                                        <DropdownMenuCheckboxItem
                                                            key={title}
                                                            checked={selectedMeetings.includes(title)}
                                                            onCheckedChange={(checked) => {
                                                                setSelectedMeetings(prev => checked ? [...prev, title] : prev.filter(t => t !== title));
                                                            }}
                                                            onSelect={(e) => e.preventDefault()}
                                                            className="text-xs"
                                                        >
                                                            {title}
                                                        </DropdownMenuCheckboxItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </th>
                                    <th className="py-3 px-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest leading-none w-40">Topic</th>
                                    <th className="py-3 px-3 text-left text-xs font-bold text-slate-400 tracking-widest leading-none min-w-[200px] max-w-[400px]">Updates</th>
                                    <th className="py-3 px-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest leading-none w-32">
                                        <div className="flex items-center justify-between gap-1">
                                            <button onClick={() => handleSort('ownerName')} className="flex items-center gap-1 hover:text-gray-600 transition-colors">
                                                Owner
                                                {sortConfig?.key === 'ownerName' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : null}
                                            </button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className={cn("p-0.5 rounded hover:bg-gray-200 transition-colors", selectedOwners.length > 0 && "text-gray-900")}>
                                                        <Filter className="w-3 h-3" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start" className="w-48">
                                                    <DropdownMenuLabel className="text-xs">Filter by Owner</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    {allOwners.map(owner => (
                                                        <DropdownMenuCheckboxItem
                                                            key={owner}
                                                            checked={selectedOwners.includes(owner)}
                                                            onCheckedChange={(checked) => {
                                                                setSelectedOwners(prev => checked ? [...prev, owner] : prev.filter(o => o !== owner));
                                                            }}
                                                            onSelect={(e) => e.preventDefault()}
                                                            className="text-xs"
                                                        >
                                                            {owner}
                                                        </DropdownMenuCheckboxItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </th>
                                    <th className="py-3 px-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest leading-none w-44">
                                        <button onClick={() => handleSort('meetingDate')} className="flex items-center gap-1 hover:text-gray-600 transition-colors">
                                            Meeting Date
                                            {sortConfig?.key === 'meetingDate' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : null}
                                        </button>
                                    </th>
                                    <th className="py-3 px-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest leading-none w-28">
                                        <button onClick={() => handleSort('dueDate')} className="flex items-center gap-1 hover:text-gray-600 transition-colors">
                                            Due
                                            {sortConfig?.key === 'dueDate' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : null}
                                        </button>
                                    </th>
                                    <th className="py-3 pl-2 pr-4 text-right w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredActions.map((item) => (
                                    <ActionItemRow key={item.id} item={item} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <ListTodo className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No action items found</h3>
                    <p className="text-slate-500 font-medium">Tasks from your meetings will appear here.</p>
                </div>
            )}
        </div>
    );
}

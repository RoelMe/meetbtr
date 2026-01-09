"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CalculatedTopic, formatTopicTime } from "../../lib/agenda-math";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import {
    GripVertical,
    Clock,
    User,
    Presentation,
    MessageSquare,
    Target,
    Coffee,
    Circle,
    ChevronDown,
    ChevronUp,
    Pencil,
    Trash2,
    CheckCircle,
    Check
} from "lucide-react";
import { OwnerPicker } from "./OwnerPicker";
import { ActionItemForm } from "./ActionItemForm";
import { ActionItemListItem } from "./ActionItemListItem";
import { useActionItems } from "../../hooks/useActionItems";
import { ListTodo } from "lucide-react";
import { DebouncedTextarea } from "../ui/debounced-textarea";

interface TopicCardProps {
    topic: CalculatedTopic;
    timezone: string;
    isActive: boolean;
    secondsRemaining: number | null;
    isOvertime: boolean;
    onUpdate: (updates: any) => void;
    onDelete: () => void;
    isOverrunContainer?: boolean;
    isOverrun?: boolean;
    dragHandleProps?: {
        attributes: any;
        listeners: any;
    };
    className?: string;
    isReadonly?: boolean;
    meetingId: string;
    meetingTitle: string;
    meetingOwnerId: string;
    meetingScheduledAt: string;
    isInitiallyExpanded?: boolean;
}

export function TopicCard({
    topic,
    timezone,
    isActive,
    secondsRemaining,
    isOvertime,
    onUpdate,
    onDelete,
    isOverrunContainer,
    isOverrun,
    dragHandleProps,
    className,
    isReadonly = false,
    meetingId,
    meetingTitle,
    meetingOwnerId,
    meetingScheduledAt,
    isInitiallyExpanded = false
}: TopicCardProps) {
    const { user } = useAuth();
    const { actionItems, addActionItem, toggleActionItem, deleteActionItem, updateActionItem } = useActionItems(meetingId, topic.id);
    const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);
    const [editingField, setEditingField] = useState<string | null>(null);

    React.useEffect(() => {
        if (isInitiallyExpanded) {
            setIsExpanded(true);
        }
    }, [isInitiallyExpanded]);
    const isEditing = !!editingField && !isReadonly;

    const topicTypes = ['presentation', 'discussion', 'decision', 'break'] as const;

    const handleUpdateField = (field: string, value: any) => {
        if (isReadonly) return;
        onUpdate({ [field]: value });
    };

    const typeIcons = {
        presentation: <Presentation className="w-3 h-3 mr-1" />,
        discussion: <MessageSquare className="w-3 h-3 mr-1" />,
        decision: <Target className="w-3 h-3 mr-1" />,
        break: <Coffee className="w-3 h-3 mr-1" />
    };

    const typeColors = {
        presentation: "bg-blue-50 text-blue-700 border-blue-200",
        discussion: "bg-green-50 text-green-700 border-green-200",
        decision: "bg-amber-50 text-amber-700 border-amber-200",
        break: "bg-slate-50 text-slate-700 border-slate-200"
    };

    return (
        <Card className={cn(
            "group relative transition-all duration-300 border rounded-2xl",
            isOverrunContainer ? "border-slate-200 border-l-amber-400 border-l-[6px]" : isActive ? "border-slate-950 border-2 shadow-lg shadow-slate-200/50" : "border-slate-200",
            isOverrun ? "border-red-200 bg-red-50/50" : "bg-white",
            !isActive && !isOverrun && !isOverrunContainer && "hover:border-slate-300 shadow-sm",
            className
        )}>
            <div className="flex items-stretch min-h-[100px]">
                {/* Left Gutter - Grip Area */}
                <div className="w-14 flex flex-col items-center pt-5 flex-shrink-0">
                    {!isReadonly && (
                        <div
                            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab hover:text-slate-600 active:cursor-grabbing p-1"
                            {...dragHandleProps?.attributes}
                            {...dragHandleProps?.listeners}
                        >
                            <GripVertical className="w-5 h-5 text-slate-300" />
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 py-4 px-4 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs font-medium text-slate-500">
                        {isEditing ? (
                            <Input
                                type="time"
                                defaultValue={formatTopicTime(topic.startTime, timezone)}
                                className="h-6 w-24 py-0 px-1 text-[10px]"
                                onBlur={(e) => onUpdate({ startTime: e.target.value })}
                                autoFocus={editingField === 'startTime'}
                            />
                        ) : (
                            <span
                                className={cn(
                                    "font-mono px-1 rounded transition-colors",
                                    !isReadonly && "cursor-pointer hover:text-slate-900 hover:bg-slate-100"
                                )}
                                onClick={() => !isReadonly && setEditingField('startTime')}
                            >
                                {formatTopicTime(topic.startTime, timezone)}
                            </span>
                        )}
                        <span className="text-slate-300">•</span>

                        {isEditing ? (
                            <div className="flex items-center gap-1">
                                <Input
                                    type="number"
                                    defaultValue={topic.duration}
                                    className="h-6 w-12 py-0 px-1 text-[10px]"
                                    onBlur={(e) => onUpdate({ duration: parseInt(e.target.value) || 0 })}
                                    autoFocus={editingField === 'duration'}
                                />
                                <span>m</span>
                            </div>
                        ) : (
                            <span
                                className={cn(
                                    "px-1 rounded transition-colors",
                                    !isReadonly && "cursor-pointer hover:text-slate-900 hover:bg-slate-100"
                                )}
                                onClick={() => !isReadonly && setEditingField('duration')}
                            >
                                {topic.duration}m
                            </span>
                        )}

                        {isEditing ? (
                            <Select
                                value={topic.type}
                                onChange={(e: any) => onUpdate({ type: e.target.value })}
                                className="h-6 text-[10px] py-0 w-28"
                                autoFocus={editingField === 'type'}
                            >
                                {topicTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </Select>
                        ) : (
                            <Badge
                                variant="outline"
                                className={cn(
                                    "ml-1 capitalize py-0 h-5 transition-all",
                                    !isReadonly && "cursor-pointer hover:ring-1 hover:ring-slate-300",
                                    typeColors[topic.type]
                                )}
                                onClick={() => !isReadonly && setEditingField('type')}
                            >
                                {typeIcons[topic.type]}
                                {topic.type}
                            </Badge>
                        )}

                        {isActive && (
                            <Badge className={cn(
                                "text-white border-0 h-5 px-2 animate-pulse",
                                isOvertime ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
                            )}>
                                <Clock className="w-3 h-3 mr-1" />
                                {isOvertime ? 'Overtime' : 'Live'}
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <button
                                onClick={() => !isReadonly && onUpdate({ isCompleted: !topic.isCompleted })}
                                disabled={isReadonly}
                                className={cn(
                                    "flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center group/check",
                                    topic.isCompleted
                                        ? "bg-green-500 border-green-500 text-white"
                                        : "bg-white border-slate-200 text-transparent hover:border-green-400 hover:text-green-400",
                                    isReadonly && "cursor-default"
                                )}
                            >
                                <Check className={cn("w-4 h-4 transition-transform", topic.isCompleted ? "scale-100" : "scale-0 group-hover/check:scale-100")} />
                            </button>
                            <div className="flex-1 min-w-0">
                                {isEditing ? (
                                    <Input
                                        defaultValue={topic.title}
                                        className="h-8 text-lg font-semibold border-slate-200 focus-visible:ring-slate-400"
                                        onBlur={(e) => onUpdate({ title: e.target.value })}
                                        autoFocus={editingField === 'title'}
                                    />
                                ) : (
                                    <h3
                                        className={cn(
                                            "text-lg font-semibold transition-all truncate rounded px-1 -ml-1",
                                            topic.isCompleted ? "text-slate-400 line-through" : "text-slate-900",
                                            !isReadonly && "cursor-pointer hover:bg-slate-50"
                                        )}
                                        onClick={() => !isReadonly && setEditingField('title')}
                                    >
                                        {topic.title}
                                    </h3>
                                )}

                                <div className="mt-1 flex items-center">
                                    {isEditing ? (
                                        <OwnerPicker
                                            value={topic.ownerName || ""}
                                            ownerId={topic.ownerId}
                                            onSelect={(name, id) => onUpdate({ ownerName: name, ownerId: id || null })}
                                            className="w-48"
                                            autoFocus={editingField === 'owner'}
                                        />
                                    ) : (
                                        topic.ownerName && (
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    "bg-slate-100 text-slate-600 border-0 h-5 px-2 transition-colors",
                                                    !isReadonly && "hover:bg-slate-200 cursor-pointer"
                                                )}
                                                onClick={() => !isReadonly && setEditingField('owner')}
                                            >
                                                <User className="w-3 h-3 mr-1.5" />
                                                {topic.ownerName}
                                            </Badge>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                        {isActive && secondsRemaining !== null && (
                            <div className={cn(
                                "text-2xl font-mono font-bold flex-shrink-0",
                                isOvertime ? "text-red-600" : "text-slate-900",
                                topic.isCompleted && "text-slate-300"
                            )}>
                                {isOvertime ? '-' : ''}{Math.floor(Math.abs(secondsRemaining) / 60)}:{(Math.abs(secondsRemaining) % 60).toString().padStart(2, '0')}
                            </div>
                        )}
                    </div>

                    {isExpanded && (
                        <div className="mt-4 space-y-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Context</label>
                                <p className="text-sm text-slate-600 leading-relaxed">{topic.description || "No context provided."}</p>
                            </div>
                            <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[10px] font-bold text-gray-700/70 uppercase tracking-wider block">Notes</label>
                                    {!isReadonly && (
                                        <div className="flex items-center text-[10px] text-gray-600/50">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            <span>Auto-saving</span>
                                        </div>
                                    )}
                                </div>
                                <DebouncedTextarea
                                    value={topic.notes || ""}
                                    onSave={(val: string) => onUpdate({ notes: val })}
                                    placeholder={isReadonly ? "No notes recorded." : "Capture key points here..."}
                                    className="bg-transparent border-0 focus-visible:ring-0 p-0 text-sm text-slate-700 min-h-[100px] resize-none"
                                    readOnly={isReadonly}
                                />
                            </div>

                            {/* Action Items Section */}
                            <div className="pt-2">
                                <div className="flex items-center gap-2 mb-3">
                                    <ListTodo className="w-4 h-4 text-slate-900" />
                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Action Items</h4>
                                    {actionItems.length > 0 && (
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-0 h-4 px-1.5 text-[10px]">
                                            {actionItems.filter(i => i.isCompleted).length}/{actionItems.length}
                                        </Badge>
                                    )}
                                </div>

                                <div className="space-y-1 mb-4">
                                    {actionItems.map(item => (
                                        <ActionItemListItem
                                            key={item.id}
                                            item={item}
                                            onToggle={toggleActionItem}
                                            onUpdate={updateActionItem}
                                            onDelete={deleteActionItem}
                                            disabled={false}
                                        />
                                    ))}
                                    {actionItems.length === 0 && !isReadonly && (
                                        <p className="text-[10px] text-slate-400 italic ml-1">No action items yet.</p>
                                    )}
                                </div>

                                <ActionItemForm onAdd={(title, owner, date, ownerId) => {
                                    addActionItem(title, owner, date, meetingTitle, topic.title, meetingOwnerId, ownerId, meetingScheduledAt);
                                }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Gutter - Actions & Toggle */}
                <div className="w-14 flex flex-col items-center py-4 flex-shrink-0 relative">
                    <div className={cn(
                        "absolute top-4 right-2 flex items-center gap-0.5",
                        isReadonly ? "opacity-0" : "opacity-0 group-hover:opacity-100 transition-opacity"
                    )}>
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={isReadonly}
                            className={cn(
                                "h-8 w-8 transition-colors hover:bg-slate-100/50",
                                isEditing ? "text-green-600 bg-green-50" : "text-slate-400 hover:text-blue-600"
                            )}
                            onClick={() => !isReadonly && setEditingField(isEditing ? null : 'title')}
                        >
                            {isEditing ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={isReadonly}
                            onClick={() => !isReadonly && onDelete()}
                            className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-slate-100/50"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Fixed Position Toggle - Centered in the gutter zone */}
                    <div className="absolute top-[74px] right-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-lg flex items-center justify-center hover:bg-transparent transition-colors"
                        >
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}

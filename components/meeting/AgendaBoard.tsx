"use client";

import React from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TopicCard } from "./TopicCard";
import { CalculatedTopic } from "../../lib/agenda-math";
import { Plus } from "lucide-react";
import { Meeting } from "../../types";
import { format, addMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { MentionCandidate } from "@/components/ui/mention-textarea";

interface AgendaBoardProps {
    meeting: Meeting;
    topics: CalculatedTopic[];
    topicOrder: string[];
    timezone: string;
    activeTopicId: string | null;
    secondsRemaining: number | null;
    isOvertime: boolean;
    onReorder: (newOrder: string[]) => void;
    onUpdateTopic: (id: string, updates: any) => void;
    onDeleteTopic: (id: string) => void;
    onEmptyStateAddClick?: () => void;
    disabled?: boolean;
    expandedTopicId?: string | null;
    participants?: MentionCandidate[];
}

export function AgendaBoard({
    meeting,
    topics,
    topicOrder,
    timezone,
    activeTopicId,
    secondsRemaining,
    isOvertime,
    onReorder,
    onUpdateTopic,
    onDeleteTopic,
    onEmptyStateAddClick,
    disabled = false,
    expandedTopicId,
    participants = []
}: AgendaBoardProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        if (disabled) return;

        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = topicOrder.indexOf(active.id as string);
            const newIndex = topicOrder.indexOf(over.id as string);
            const newOrder = arrayMove(topicOrder, oldIndex, newIndex);
            onReorder(newOrder);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={topicOrder} strategy={verticalListSortingStrategy} disabled={disabled}>
                <div className="space-y-3 relative">

                    {(() => {
                        const scheduledMinutes = Number(meeting.scheduledDuration);
                        let currentCumulative = 0;
                        let endLineDrawn = false;

                        // Pre-calculate layout data to avoid mutable state issues in render
                        const layoutItems = topicOrder.map((id) => {
                            const topic = topics.find((t) => t.id === id);
                            if (!topic) return null;

                            const duration = Number(topic.duration);
                            const start = currentCumulative;
                            const end = currentCumulative + duration;
                            currentCumulative = end;

                            const isOverrunContainer = start < scheduledMinutes && end > scheduledMinutes;
                            const isOverrun = start >= scheduledMinutes; // Strictly after schedule

                            // Determine if this topic should host the end-line indicator
                            // It hosts it if it contains the scheduled minute, or if it ends exactly on it
                            // But we only want to draw it once.
                            const showEndLine = !endLineDrawn && (
                                (start < scheduledMinutes && end >= scheduledMinutes) ||
                                (start === scheduledMinutes) // Starts exactly when meeting ends
                            );

                            if (showEndLine) {
                                endLineDrawn = true;
                            }

                            return {
                                topic,
                                id,
                                start,
                                end,
                                isOverrunContainer,
                                isOverrun,
                                showEndLine
                            };
                        }).filter(item => item !== null);

                        return layoutItems.map((item) => {
                            if (!item) return null; // Should be filtered already
                            const { topic, id, start, end, isOverrunContainer, isOverrun, showEndLine } = item;
                            const scheduledMinutes = Number(meeting.scheduledDuration); // Scope safety

                            return (
                                <SortableItem key={id} id={id}>
                                    {(sortableProps) => (
                                        <div className="relative">
                                            {/* End of Meeting Indicator */}
                                            {showEndLine && (() => {
                                                // If start < scheduled < end, calculate percent.
                                                // If start == scheduled, percent is 0.
                                                // If end == scheduled, percent is 100.

                                                let percent = 0;
                                                if (end > start) {
                                                    percent = ((scheduledMinutes - start) / (end - start)) * 100;
                                                }

                                                // Clamp percent between 0 and 100
                                                percent = Math.max(0, Math.min(100, percent));

                                                const topPosition = `${percent}%`;

                                                return (
                                                    <div
                                                        className="absolute left-[-32px] right-[-32px] z-0 pointer-events-none"
                                                        style={{ top: topPosition }}
                                                    >
                                                        <div className="w-full border-t-2 border-dashed border-slate-200"></div>
                                                        <div className="absolute right-[-60px] top-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-md px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 shadow-sm whitespace-nowrap">
                                                            {format(addMinutes(new Date(meeting.scheduledAt), scheduledMinutes), "h:mm")}
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            <TopicCard
                                                topic={topic}
                                                timezone={timezone}
                                                isActive={activeTopicId === id}
                                                secondsRemaining={activeTopicId === id ? secondsRemaining : null}
                                                isOvertime={activeTopicId === id ? isOvertime : false}
                                                onUpdate={(updates) => onUpdateTopic(id, updates)}
                                                onDelete={() => onDeleteTopic(id)}
                                                isOverrunContainer={isOverrunContainer}
                                                isOverrun={isOverrun}
                                                dragHandleProps={{
                                                    attributes: sortableProps.attributes,
                                                    listeners: sortableProps.listeners
                                                }}
                                                className="relative z-10"
                                                isReadonly={disabled}
                                                meetingId={meeting.id}
                                                meetingTitle={meeting.title}
                                                meetingOwnerId={meeting.ownerId}
                                                meetingScheduledAt={meeting.scheduledAt}
                                                isInitiallyExpanded={expandedTopicId === id}
                                                participants={participants}
                                            />

                                        </div>
                                    )}
                                </SortableItem>
                            );
                        });
                    })()}
                    {topicOrder.length === 0 && (
                        <div
                            className={cn(
                                "py-20 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm transition-colors group",
                                !disabled && "cursor-pointer hover:bg-white/80"
                            )}
                            onClick={!disabled ? onEmptyStateAddClick : undefined}
                        >
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 border border-blue-100 shadow-sm group-hover:scale-110 transition-transform">
                                <Plus className="w-8 h-8 text-blue-400/80" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-1">No topics yet</h3>
                            <p className="text-slate-500 font-medium tracking-tight">
                                {disabled ? "There are no topics in this archived meeting." : "Add your first agenda item below to get started."}
                            </p>
                        </div>
                    )}
                </div>
            </SortableContext>
        </DndContext>
    );
}

function SortableItem({ id, children }: { id: string; children: (props: { attributes: any, listeners: any }) => React.ReactNode }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
    };

    return (
        <div ref={setNodeRef} style={style}>
            {children({ attributes, listeners })}
        </div>
    );
}

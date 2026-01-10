"use client";

import React, { useMemo, useEffect, useRef } from "react";
import { Meeting, Topic } from "../types";
import { MeetingHeader } from "./meeting/MeetingHeader";
import { AgendaBoard } from "./meeting/AgendaBoard";
import { AddTopicForm } from "./meeting/AddTopicForm";
import { calculateTopicTimes } from "../lib/agenda-math";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../lib/firebase";
import confetti from "canvas-confetti";
import { useAuth } from "@/hooks/useAuth";
import { Archive } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
interface MeetingWorkspaceProps {
  meeting: Meeting;
  topics: Topic[];
  expandedTopicId?: string | null;
}

import { useMeetingTimer } from "../hooks/useMeetingTimer";
import { useMeetingSeries } from "../hooks/useMeetingSeries";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export function MeetingWorkspace({ meeting, topics, expandedTopicId }: MeetingWorkspaceProps) {
  const meetingId = meeting.id;
  const timerState = useMeetingTimer(meeting, topics);
  const [addTopicFocusTrigger, setAddTopicFocusTrigger] = React.useState(0);
  const [isAddingTopic, setIsAddingTopic] = React.useState(false);
  const { previous, next, loading: seriesLoading } = useMeetingSeries(meeting);
  const router = useRouter();

  const { user } = useAuth();

  const prevStatusRef = useRef(meeting.status);

  // Trigger confetti when meeting ends (only if transition occurs during session)
  useEffect(() => {
    if (prevStatusRef.current !== 'ended' && meeting.status === 'ended') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#3b82f6', '#60a5fa']
      });
    }
    prevStatusRef.current = meeting.status;
  }, [meeting.status]);

  // Update search keywords for the dashboard
  useEffect(() => {
    // We only update if the meeting object exists and is not currently being transferred or deleted
    if (!meeting || meeting.isDeleted) return;

    const activeTopics = topics.filter(t => !t.isDeleted);
    // Build a more robust keyword string: "Title (Presenter) Title (Presenter)"
    const keywords = activeTopics
      .map(t => `${t.title || ''} ${t.ownerName || ''}`.trim())
      .filter(str => str.length > 0)
      .join(' | ')
      .toLowerCase();

    // Only update if keywords have changed to avoid infinite loops/unnecessary writes
    if (meeting.searchKeywords !== keywords) {
      const meetingRef = doc(db, "meetings", meetingId);
      updateDoc(meetingRef, { searchKeywords: keywords });
    }
  }, [topics, meeting.searchKeywords, meetingId, meeting.isDeleted]);

  // Handle ownership transfer if a guest signs in with Google
  useEffect(() => {
    const transferOwnership = async () => {
      if (user && !user.isAnonymous && (meeting.ownerId === 'guest' || meeting.ownerId === 'anonymous')) {
        const meetingRef = doc(db, "meetings", meetingId);
        await updateDoc(meetingRef, {
          ownerId: user.uid
        });
      }
    };
    transferOwnership();
  }, [user, meeting.ownerId, meetingId]);

  // Calculate topic times for the agenda engine (Planning mode)
  const calculatedTopics = useMemo(() => {
    return calculateTopicTimes(new Date(meeting.scheduledAt), topics, meeting.topicOrder);
  }, [meeting, topics]);

  // Calculate topic times for adjacent meetings
  const prevCalculatedTopics = useMemo(() => {
    if (!previous) return [];
    return calculateTopicTimes(new Date(previous.meeting.scheduledAt), previous.topics, previous.meeting.topicOrder);
  }, [previous]);

  const nextCalculatedTopics = useMemo(() => {
    if (!next) return [];
    return calculateTopicTimes(new Date(next.meeting.scheduledAt), next.topics, next.meeting.topicOrder);
  }, [next]);

  const handleStartMeeting = async () => {
    const meetingRef = doc(db, "meetings", meetingId);
    await updateDoc(meetingRef, {
      status: "running",
      startedAt: serverTimestamp(),
    });
  };

  const handleEndMeeting = async () => {
    const meetingRef = doc(db, "meetings", meetingId);
    await updateDoc(meetingRef, {
      status: "ended",
      isArchived: true,
    });
  };

  const handleReorder = async (newOrder: string[]) => {
    if (meeting.isArchived) return;
    const meetingRef = doc(db, "meetings", meetingId);
    await updateDoc(meetingRef, {
      topicOrder: newOrder,
    });
  };

  const handleAddTopic = async (topicData: { title: string; duration: number; type: string; ownerName: string }) => {
    const topicsRef = collection(db, "meetings", meetingId, "topics");
    const docRef = await addDoc(topicsRef, {
      ...topicData,
      description: "",
      notes: "",
      isCompleted: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
    });

    const meetingRef = doc(db, "meetings", meetingId);
    await updateDoc(meetingRef, {
      topicOrder: [...meeting.topicOrder, docRef.id],
    });
  };

  const handleUpdateTopic = async (id: string, updates: any) => {
    if (meeting.isArchived) return;
    const topicRef = doc(db, "meetings", meetingId, "topics", id);

    // Add completedAt timestamp when marking as completed
    const enrichedUpdates = { ...updates };
    if ('isCompleted' in updates) {
      enrichedUpdates.completedAt = updates.isCompleted ? serverTimestamp() : null;
    }

    await updateDoc(topicRef, enrichedUpdates);

    // If a topic was just completed, trigger confetti
    if (updates.isCompleted === true) {
      const remainingTopics = topics.filter((t: Topic) => !t.isDeleted && t.id !== id && !t.isCompleted);

      if (remainingTopics.length === 0) {
        // Big celebration for finishing the last topic
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7'] // Green shades
        });
      } else {
        // Small burst for individual topic
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#10b981', '#34d399']
        });
      }
    }
  };

  const handleDeleteTopic = async (id: string) => {
    if (meeting.isArchived) return;
    const topicRef = doc(db, "meetings", meetingId, "topics", id);
    await updateDoc(topicRef, { isDeleted: true });
    // Note: We don't remove from topicOrder to keep it idempotent, 
    // the AgendaBoard filters topics not found in the topics array.
    // However, it's cleaner to remove it eventually.
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert("Meeting link copied to clipboard!");
  };

  // Calculate end time based on scheduled duration (fixed)
  const endTime = useMemo(() => {
    const start = new Date(meeting.scheduledAt);
    return new Date(start.getTime() + meeting.scheduledDuration * 60000);
  }, [meeting.scheduledAt, meeting.scheduledDuration]);

  // Calculate total duration of topics
  const topicsTotalDuration = useMemo(() => {
    return topics.reduce((sum: number, t: Topic) => sum + (t.isDeleted ? 0 : t.duration), 0);
  }, [topics]);

  // Compute participants for mentions
  const participants = useMemo(() => {
    const uniqueParticipants = new Map<string, { id: string; name: string }>();

    // Re-added current user so the menu appears (user feedback 1277)
    if (user && user.uid) {
      uniqueParticipants.set(user.uid, {
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || "Me"
      });
    }

    topics.forEach(t => {
      if (t.ownerId && t.ownerName) { // Allow dupes with user to be filtered by map set if needed, but actually we want all
        // Map handles dupes by ID.
        uniqueParticipants.set(t.ownerId, { id: t.ownerId, name: t.ownerName });
      }
    });

    return Array.from(uniqueParticipants.values());
  }, [topics, user]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto relative group/nav-container">

        {/* Navigation Controls */}
        {previous && (
          <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 hidden xl:block">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full shadow-lg bg-white/80 backdrop-blur hover:bg-white text-slate-600 border-slate-200"
              onClick={() => router.push(`/meeting/${previous.meeting.id}`)}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>
        )}

        {next && (
          <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden xl:block">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full shadow-lg bg-white/80 backdrop-blur hover:bg-white text-slate-600 border-slate-200"
              onClick={() => router.push(`/meeting/${next.meeting.id}`)}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        )}

        {meeting.isArchived && (
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl mb-8 flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-4 duration-500 max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Archive className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm tracking-wide">ARCHIVED MEETING</p>
                <p className="text-slate-400 text-xs">This meeting has ended and is now read-only.</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 border border-white/20 rounded-xl">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <MeetingHeader
            meeting={meeting}
            endTime={endTime}
            topicsTotalDuration={topicsTotalDuration}
            onStart={handleStartMeeting}
            onEnd={handleEndMeeting}
            onShare={handleShare}
          />
        </div>

        <div className="flex items-start justify-center gap-8 mt-6">

          {/* Previous Meeting Preview (Left) */}
          <div
            className={`hidden xl:block w-[320px] shrink-0 opacity-40 hover:opacity-100 transition-all duration-300 cursor-pointer overflow-hidden mask-fade-left ${previous ? '' : 'invisible'}`}
            onClick={() => previous && router.push(`/meeting/${previous.meeting.id}`)}
            style={{ maskImage: 'linear-gradient(to left, black 30%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, black 30%, transparent 100%)' }}
          >
            {previous && (
              <div className="pointer-events-none scale-90 origin-top-right">
                <div className="mb-4 text-right">
                  <div className="text-sm font-bold text-slate-400">{format(new Date(previous.meeting.scheduledAt), 'MMM d, yyyy')}</div>
                  <div className="text-xs text-slate-300">Previous</div>
                </div>
                <AgendaBoard
                  meeting={previous.meeting}
                  topics={prevCalculatedTopics}
                  topicOrder={previous.meeting.topicOrder}
                  timezone={previous.meeting.timezone}
                  activeTopicId={null}
                  secondsRemaining={null}
                  isOvertime={false}
                  onReorder={() => { }}
                  onUpdateTopic={() => { }}
                  onDeleteTopic={() => { }}
                  disabled={true}
                />
              </div>
            )}
          </div>

          {/* Current Meeting (Center) */}
          <div className="w-full max-w-4xl shrink-0">
            <AgendaBoard
              meeting={meeting}
              topics={calculatedTopics}
              topicOrder={meeting.topicOrder}
              timezone={meeting.timezone}
              activeTopicId={timerState.activeTopicId}
              secondsRemaining={timerState.secondsRemaining}
              isOvertime={timerState.isOvertime}
              onReorder={handleReorder}
              onUpdateTopic={handleUpdateTopic}
              onDeleteTopic={handleDeleteTopic}
              onEmptyStateAddClick={() => setAddTopicFocusTrigger(prev => prev + 1)}
              disabled={meeting.isArchived}
              expandedTopicId={expandedTopicId}
              participants={participants}
            />

            {meeting.status === 'planning' && !meeting.isArchived && (
              <div className="mt-4 flex justify-center">
                {topics.length === 0 || isAddingTopic ? (
                  <div className="w-full">
                    <AddTopicForm
                      onAdd={(data) => {
                        handleAddTopic(data);
                        setIsAddingTopic(false);
                      }}
                      shouldFocus={addTopicFocusTrigger}
                    />
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => setIsAddingTopic(true)}
                    className="text-slate-900 hover:bg-slate-100 p-2 h-auto font-medium text-lg flex items-center gap-2 hover:text-slate-700 transition-colors rounded-xl"
                  >
                    <Plus className="w-5 h-5" />
                    topic
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Next Meeting Preview (Right) */}
          <div
            className={`hidden xl:block w-[320px] shrink-0 opacity-40 hover:opacity-100 transition-all duration-300 cursor-pointer overflow-hidden ${next ? '' : 'invisible'}`}
            onClick={() => next && router.push(`/meeting/${next.meeting.id}`)}
            style={{ maskImage: 'linear-gradient(to right, black 30%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 30%, transparent 100%)' }}
          >
            {next && (
              <div className="pointer-events-none scale-90 origin-top-left">
                <div className="mb-4 text-left">
                  <div className="text-sm font-bold text-slate-400">{format(new Date(next.meeting.scheduledAt), 'MMM d, yyyy')}</div>
                  <div className="text-xs text-slate-300">Next</div>
                </div>
                <AgendaBoard
                  meeting={next.meeting}
                  topics={nextCalculatedTopics}
                  topicOrder={next.meeting.topicOrder}
                  timezone={next.meeting.timezone}
                  activeTopicId={null}
                  secondsRemaining={null}
                  isOvertime={false}
                  onReorder={() => { }}
                  onUpdateTopic={() => { }}
                  onDeleteTopic={() => { }}
                  disabled={true}
                />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
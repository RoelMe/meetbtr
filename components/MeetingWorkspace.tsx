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

export function MeetingWorkspace({ meeting, topics, expandedTopicId }: MeetingWorkspaceProps) {
  const meetingId = meeting.id;
  const timerState = useMeetingTimer(meeting, topics);
  const [addTopicFocusTrigger, setAddTopicFocusTrigger] = React.useState(0);

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

  // Calculate end time
  const endTime = useMemo(() => {
    const start = new Date(meeting.scheduledAt);
    const totalDuration = topics.reduce((sum: number, t: Topic) => sum + (t.isDeleted ? 0 : t.duration), 0);
    return new Date(start.getTime() + totalDuration * 60000);
  }, [meeting.scheduledAt, topics]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {meeting.isArchived && (
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl mb-8 flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
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

        <MeetingHeader
          meeting={meeting}
          endTime={endTime}
          onStart={handleStartMeeting}
          onEnd={handleEndMeeting}
          onShare={handleShare}
        />

        <div className="grid grid-cols-1 gap-6">
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
          />

          {meeting.status === 'planning' && !meeting.isArchived && (
            <div className="mt-4">
              <AddTopicForm
                onAdd={handleAddTopic}
                shouldFocus={addTopicFocusTrigger}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
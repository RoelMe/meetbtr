"use client";

import React, { useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useMeeting } from "@/hooks/useMeeting";
import { MeetingWorkspace } from "@/components/MeetingWorkspace";

function MeetingWorkspacePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { user, loading: authLoading, signInAnonymously } = useAuth();
    const meetingId = params.id as string;
    const expandedTopicId = searchParams.get('topic');
    const { meeting, topics, loading: meetingLoading, error } = useMeeting(meetingId);

    useEffect(() => {
        if (!authLoading && !user) {
            signInAnonymously();
        }
    }, [user, authLoading, signInAnonymously]);

    if (authLoading || meetingLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center animate-pulse">
                    <div className="h-10 w-10 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-200"></div>
                    <p className="text-slate-500 text-lg font-medium">Preparing workspace...</p>
                </div>
            </div>
        );
    }

    if (error || !meeting) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Meeting Not Found</h1>
                    <p className="text-slate-500">The meeting you are looking for doesn't exist or you don't have access.</p>
                </div>
            </div>
        );
    }

    return <MeetingWorkspace meeting={meeting} topics={topics} expandedTopicId={expandedTopicId} />;
}

export default function Page() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
            <MeetingWorkspacePage />
        </Suspense>
    );
}

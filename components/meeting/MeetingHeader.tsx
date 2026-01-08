"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    Clock,
    Play,
    Pause,
    Square,
    Share2,
    MoreHorizontal
} from "lucide-react";
import { Meeting } from "../../types";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

interface MeetingHeaderProps {
    meeting: Meeting;
    endTime: Date;
    onStart: () => void;
    onEnd: () => void;
    onShare: () => void;
}

export function MeetingHeader({ meeting, endTime, onStart, onEnd, onShare }: MeetingHeaderProps) {
    const { user, signOut, signInWithGoogle } = useAuth();
    const startDate = new Date(meeting.scheduledAt);
    const formattedDate = format(startDate, "MMMM do, yyyy");
    const formattedStartTime = format(startDate, "h:mm a");
    const formattedEndTime = format(endTime, "h:mm a");

    // Get abbreviated timezone and city (e.g., "GMT, Lisbon")
    const timezoneDisplay = React.useMemo(() => {
        try {
            const parts = new Intl.DateTimeFormat('en-US', {
                timeZone: meeting.timezone,
                timeZoneName: 'short'
            }).formatToParts(startDate);

            const abbr = parts.find(p => p.type === 'timeZoneName')?.value || "";
            const city = meeting.timezone.split('/').pop()?.replace('_', ' ') || "";

            return `(${abbr}, ${city})`;
        } catch (e) {
            return `(${meeting.timezone})`;
        }
    }, [meeting.timezone, startDate]);


    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (error: any) {
            if (error.code === 'auth/operation-not-allowed') {
                alert(
                    "Google Sign-In is not enabled:\n\n" +
                    "Please go to your Firebase Console > Authentication > Settings > User sign-in and enable 'Google' to proceed."
                );
            } else {
                alert("Sign-in failed. Please try again.");
            }
        }
    };

    const handleShareClick = () => {
        if (user?.isAnonymous) {
            // If anonymous, we want to prompt them to sign in
            // For now, let's trigger Google sign in but with a clear intent
            if (confirm("Sign in with Google to enable link sharing and save your meeting indefinitely?")) {
                handleGoogleSignIn();
            }
        } else {
            onShare();
        }
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-start gap-4 flex-1">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{meeting.title}</h1>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{formattedDate}</span>
                        </div>
                        <span className="text-slate-300">|</span>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>{formattedStartTime} - {formattedEndTime}</span>
                        </div>
                        <span className="text-slate-400 font-normal">{timezoneDisplay}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 mr-2">
                    {meeting.status === 'planning' && (
                        <Button onClick={onStart} className="bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-200">
                            <Play className="w-4 h-4 mr-2 fill-current" />
                            Start Meeting
                        </Button>
                    )}
                    {meeting.status === 'running' && (
                        <Button onClick={onEnd} variant="destructive" className="shadow-md shadow-red-200">
                            <Square className="w-4 h-4 mr-2 fill-current" />
                            End Meeting
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleShareClick}
                        className={cn("bg-slate-100 hover:bg-slate-200 text-black border border-slate-200 shadow-sm")}
                        title={user?.isAnonymous ? "Sign in to share" : "Share meeting"}
                    >
                        <Share2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

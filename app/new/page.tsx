"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { LogIn } from 'lucide-react';

export default function CreateMeetingPage() {
  const router = useRouter();
  const { user, loading: authLoading, signInAnonymously } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0], // Default to today
    startTime: '09:00',
    endTime: '10:00'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let currentUser = user;

      // If not logged in, sign in anonymously first
      if (!currentUser) {
        await signInAnonymously();
        // The auth state change might take a moment to propagate to the hook,
        // but for document creation we can proceed or check auth.currentUser
      }

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`);
      const scheduledDuration = Math.round((endDateTime.getTime() - startDateTime.getTime()) / 60000);

      const docRef = await addDoc(collection(db, 'meetings'), {
        title: formData.title || "Untitled Meeting",
        ownerId: currentUser?.uid || "guest", // Will be updated on next sync if needed
        status: 'planning',
        scheduledAt: startDateTime.toISOString(),
        scheduledDuration: scheduledDuration,
        timezone: timezone,
        topicOrder: [],
        startedAt: null,
        isDeleted: false,
        isArchived: false,
        guestAccess: true,
        createdAt: new Date().toISOString(),
        searchKeywords: "",
      });

      router.push(`/meeting/${docRef.id}`);
    } catch (error: any) {
      console.error("Error creating meeting:", error);

      if (error.code === 'auth/operation-not-allowed') {
        alert(
          "Firebase Configuration Error:\n\n" +
          "It looks like Anonymous Auth is not enabled in your Firebase Console.\n\n" +
          "Please go to Authentication > Settings > User sign-in and enable 'Anonymous' to proceed."
        );
      } else {
        alert("Failed to create meeting. Please try again. Error: " + (error.message || "Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden">
        {/* Header Section with the design you liked */}
        <div className="bg-slate-900 pt-12 pb-8 px-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-white/10">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Agenda Builder</h1>
          <p className="text-slate-400 max-w-[280px]">Plan your next meeting effectively.</p>
        </div>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-semibold text-slate-700">
                Meeting Title
              </label>
              <Input
                id="title"
                placeholder="e.g., Weekly Sync"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-semibold text-slate-700">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="bg-white pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="startTime" className="text-sm font-semibold text-slate-700">
                  Start Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    className="bg-white pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="endTime" className="text-sm font-semibold text-slate-700">
                  End Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                    className="bg-white pl-10"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 text-base mt-4 shadow-lg shadow-slate-900/20 rounded-xl transition-all"
              disabled={loading}
            >
              {loading ? (
                "Creating..."
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-3" /> Create Agenda
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

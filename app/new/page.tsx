"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Plus, Repeat } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { LogIn } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { addDays, addWeeks, addMonths, addYears, isAfter, parseISO, startOfDay } from 'date-fns';

export default function CreateMeetingPage() {
  const router = useRouter();
  const { user, loading: authLoading, signInAnonymously } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0], // Default to today
    startTime: '09:00',
    endTime: '10:00',
    isRecurring: false,
    recurrenceFrequency: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    recurrenceEndDate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let currentUser = user;

      // If not logged in, sign in anonymously first
      if (!currentUser) {
        await signInAnonymously();
        // Refresh user from auth directly as state update is async
        currentUser = auth.currentUser;
      }

      if (!currentUser) {
        throw new Error("Unable to authenticate. Please check your connection.");
      }

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const meetings: any[] = [];
      const seriesId = formData.isRecurring ? uuidv4() : undefined;

      let currentDate = new Date(`${formData.date}T${formData.startTime}:00`);
      const endDate = formData.isRecurring && formData.recurrenceEndDate
        ? new Date(`${formData.recurrenceEndDate}T23:59:59`)
        : currentDate; // effectively one occurrence if not recurring or no end date

      let occurrences = 0;
      const MAX_OCCURRENCES = 50;

      // Loop to generate occurrences
      while (occurrences < MAX_OCCURRENCES) {
        // Base case: always create at least one (the first one)
        // Check if we passed the end date
        if (formData.isRecurring && isAfter(currentDate, endDate)) {
          break;
        }

        const currentStartDateTime = new Date(currentDate);
        // Set time components from form data strictly
        const [hours, minutes] = formData.startTime.split(':').map(Number);
        currentStartDateTime.setHours(hours, minutes, 0, 0);

        const currentEndDateTime = new Date(currentStartDateTime);
        const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
        currentEndDateTime.setHours(endHours, endMinutes, 0, 0);

        // Handle overnight meetings if needed (end time < start time), assume next day
        if (currentEndDateTime < currentStartDateTime) {
          currentEndDateTime.setDate(currentEndDateTime.getDate() + 1);
        }

        const scheduledDuration = Math.round((currentEndDateTime.getTime() - currentStartDateTime.getTime()) / 60000);

        const meetingData = {
          title: formData.title || "Untitled Meeting",
          ownerId: currentUser.uid,
          status: 'planning',
          scheduledAt: currentStartDateTime.toISOString(),
          scheduledDuration: scheduledDuration,
          timezone: timezone,
          topicOrder: [],
          startedAt: null,
          isDeleted: false,
          isArchived: false,
          guestAccess: true,
          createdAt: new Date().toISOString(),
          searchKeywords: "",
          ...(formData.isRecurring ? {
            recurrence: {
              frequency: formData.recurrenceFrequency,
              endDate: formData.recurrenceEndDate,
              seriesId: seriesId
            }
          } : {})
        };

        meetings.push(meetingData);

        if (!formData.isRecurring) break;

        // Increment date for next iteration
        occurrences++;
        if (occurrences >= MAX_OCCURRENCES) break;

        switch (formData.recurrenceFrequency) {
          case 'daily':
            currentDate = addDays(currentDate, 1);
            break;
          case 'weekly':
            currentDate = addWeeks(currentDate, 1);
            break;
          case 'monthly':
            currentDate = addMonths(currentDate, 1);
            break;
          case 'yearly':
            currentDate = addYears(currentDate, 1);
            break;
        }
      }

      // Batch creation logic or individual adds (using individual for now as batch is limited to 500 but simpler to write individually)
      // We want to redirect to the FIRST created meeting.
      let firstMeetingId = "";

      for (let i = 0; i < meetings.length; i++) {
        const docRef = await addDoc(collection(db, 'meetings'), meetings[i]);
        if (i === 0) firstMeetingId = docRef.id;
      }

      router.push(`/meeting/${firstMeetingId}`);
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
        {/* Header Section */}
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

            {/* Recurrence Options */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between py-2">
                <label htmlFor="recurrence" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-slate-500" />
                  Recurring meeting
                </label>
                <Switch
                  id="recurrence"
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
                />
              </div>

              {formData.isRecurring && (
                <div className="space-y-4 pt-2 animate-in slide-in-from-top-2 fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Frequency
                      </label>
                      <Select
                        value={formData.recurrenceFrequency}
                        onValueChange={(val: any) => setFormData({ ...formData, recurrenceFrequency: val })}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Ends On
                      </label>
                      <Input
                        type="date"
                        required={formData.isRecurring}
                        value={formData.recurrenceEndDate}
                        onChange={(e) => setFormData({ ...formData, recurrenceEndDate: e.target.value })}
                        className="bg-white"
                        min={formData.date}
                      />
                    </div>
                  </div>
                </div>
              )}
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
                  <Plus className="w-5 h-5 mr-3" />
                  {formData.isRecurring ? "Create Series" : "Create Agenda"}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

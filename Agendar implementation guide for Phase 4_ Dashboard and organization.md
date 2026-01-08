# Agendar implementation guide for **Phase 4: Dashboard and Organization**.

Here is the step-by-step implementation guide for **Phase 4: Dashboard & Organization**.

**Goal:** By the end of this phase, users will be able to manage their portfolio of meetings, search instantly for specific agendas, archive completed sessions, and export calendar files.

---

### **Step 1: Install Dependencies**

We need libraries for fuzzy search and calendar file generation.

1. **Install Packages:**  
   Bash  
   npm install fuse.js ics  
1. 

   ### **Step 2: The Meeting Fetch Hook (`useUserMeetings`)**

To support client-side search, we need to fetch the user's active portfolio.

1. **Create `hooks/useUserMeetings.ts`:**  
   * **Input:** `userId`.  
2. **Query:**  
   TypeScript  
   const q \= query(  
3.   collection(db, "meetings"),  
4.   where("ownerId", "==", userId),  
5.   where("isDeleted", "==", false) // Filter out soft-deleted items  
6. );  
   *   
   * **Logic:** Use `onSnapshot` to get real-time updates.  
   * **Return:** `{ meetings, loading, error }`.

   ### **Step 3: The Dashboard Layout (Tabs & Search)**

Organize the dashboard into logical sections.

1. **Update `app/(dashboard)/page.tsx`:**  
   * Use Shadcn `Tabs`:  
     * **Default Value:** "upcoming"  
     * **Tab List:** "Upcoming" | "Past"  
   * **State:** Create local state for `searchQuery`.  
   * **Search Input:** A Shadcn `Input` field that updates `searchQuery`.  
2. **Implement Smart Search (Fuse.js):**  
7. Initialize Fuse inside the component (memoized):  
   TypeScript  
   const fuse \= new Fuse(meetings, {  
8.   keys: \["title"\],  
9.   threshold: 0.3 // Fuzzy tolerance  
10. });  
11. const results \= searchQuery ? fuse.search(searchQuery).map(r \=\> r.item) : meetings;  
    *   
    * **Filtering:** Separate `results` into `upcomingList` (status \!= "ended") and `pastList` (status \== "ended").

    ### **Step 4: The Meeting Card & Actions**

Build the UI for individual meeting items.

1. **Create `components/dashboard/meeting-card.tsx`:**  
   * **Display:** Title, Date (formatted), Status Badge.  
   * **Actions (Dropdown Menu):**  
     * **Copy Link:** Copies `window.location.origin/meeting/{id}` to clipboard.  
     * **Add to Calendar:** Triggers the `.ics` download (see Step 6).  
     * **Archive:** Sets `status: "ended", isArchived: true`.  
     * **Delete:** Sets `isDeleted: true`.  
2. **Implement Soft Delete Logic:**  
   * Ensure the "Delete" action **does not** use `deleteDoc`.  
   * It must use `updateDoc(ref, { isDeleted: true })`.  
   * *Verify:* The meeting should instantly disappear from the list (due to the hook in Step 2).

   ### **Step 5: Read-Only "Past Meetings" View**

Ensure archived meetings look and behave differently.

1. **Update `app/meeting/[id]/page.tsx`:**  
   * Check `meeting.isArchived` or `meeting.status === 'ended'`.  
   * If true:  
     * Disable Drag-and-Drop (pass `disabled` prop to DndContext).  
     * Hide "Add Topic" buttons.  
     * Render text inputs as **Read-Only** or simple `<p>` tags.  
     * Show a banner at the top: "This meeting has ended."

   ### **Step 6: Calendar Export (.ics)**

Allow users to get the agenda into Outlook/Google Calendar.

1. **Create API Route `app/api/calendar/route.ts`:**  
   * **Method:** `POST` (Accepts meeting JSON).  
   * **Logic:**  
     * Import `createEvents` from `ics`.  
     * Map `meeting.topicOrder` to description text.  
     * Generate the string.  
   * **Response:** Return a response with headers:  
     * `Content-Type: text/calendar`  
     * `Content-Disposition: attachment; filename="agenda.ics"`  
2. **Connect to Frontend:**  
   * In `MeetingCard`, the "Add to Calendar" button sends a POST request to this API and triggers the file download blob.

   ---

   ### **Phase 4 Validation Checklist**

* \[ \] **Dashboard:** I see two tabs: "Upcoming" and "Past".  
* \[ \] **Search:** Typing "Design" instantly filters the list to show only relevant meetings.  
* \[ \] **Soft Delete:** Clicking "Delete" removes the meeting from the UI, but I can see it exists (flagged `isDeleted: true`) in the Firebase Console.  
* \[ \] **Archive:** Clicking "Archive" moves the meeting to the "Past" tab.  
* \[ \] **Read-Only:** Opening a "Past" meeting shows the content, but I cannot drag cards or edit text.  
* \[ \] **Export:** Clicking "Add to Calendar" downloads a valid `.ics` file that opens in my calendar app.  
12. 
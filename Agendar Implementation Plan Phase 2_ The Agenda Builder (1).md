# Agendar **Complete & Revised Phase 2 Implementation Plan**.

Here is the step-by-step implementation guide for **Phase 2: The Agenda Builder (Core Logic)**.

**Goal:** By the end of this phase, users will be able to create a meeting, add agenda items, reorder them via drag-and-drop, and see start times calculate instantly while respecting timezones.

---

### **Step 1: Install Core Dependencies**

We need libraries for date manipulation and drag-and-drop interactions.

* **Install Packages:**  
  Bash  
  npm install date-fns date-fns-tz @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities lucide-react clsx tailwind-merge  
1. 

   ### **Step 2: Define TypeScript Interfaces**

Create the data contracts to ensure type safety across the app.

* **Create `types/index.ts`:** Define the `Meeting` and `Topic` interfaces matching your Firestore Schema.  
  TypeScript  
  export interface Topic {  
*   id: string;  
*   title: string;  
*   duration: number; // minutes  
*   notes: string;  
*   type: 'presentation' | 'discussion' | 'break';  
*   isCompleted: boolean;  
*   isDeleted: boolean;  
* }  
*   
* export interface Meeting {  
*   id: string;  
*   ownerId: string;  
*   title: string;  
*   status: 'planning' | 'running' | 'ended';  
*   scheduledAt: any; // Firestore Timestamp  
*   timezone: string; // e.g., "America/New\_York"  
*   topicOrder: string\[\]; // Array of Topic IDs  
*   startedAt: any | null;  
*   isDeleted: boolean;  
*   isArchived: boolean;  
*   guestAccess: boolean;  
* }  
1. 

   ### **Step 3: The "Create Meeting" Modal**

Build the form that initializes a meeting document.

1. **Create `components/dashboard/create-meeting-modal.tsx`:**  
   * **Inputs:** Title, Date/Time Picker.  
   * **Timezone Logic:** Use `Intl.DateTimeFormat().resolvedOptions().timeZone` to auto-detect the user's browser timezone. Set this as the default value but allow overrides.  
   * **Action:** On submit, call `addDoc` to the `meetings` collection.  
     * Initialize `topicOrder` as `[]`.  
     * Initialize `status` as `planning`.

   ### **Step 4: The Meeting Page & Subscription Hook**

Set up the real-time connection to the specific meeting room.

1. **Create `hooks/useMeeting.ts`:**  
   * Accept `meetingId` as an argument.  
   * Use `onSnapshot` to subscribe to the specific meeting document.  
   * Use a separate `onSnapshot` to subscribe to the `topics` sub-collection (query: `where("isDeleted", "==", false)`).  
   * **Return:** `{ meeting, topics, loading, error }`.  
2. **Scaffold `app/meeting/[id]/page.tsx`:**  
   * Extract `id` from params.  
   * Call `useMeeting(id)`.  
   * Render a loading spinner or 404 if not found.  
   * Render the `MeetingHeader` (Title \+ Date) and `AgendaBoard` (The list).

   ### **Step 5: The Dynamic Agenda Engine (Time Calculation)**

Implement the logic that calculates specific start times for each topic.

1. **Create `lib/agenda-math.ts`:**  
   * **Function:** `calculateTopicTimes(meetingStart, topics, topicOrder)`  
   * **Logic:**  
     * Sort the `topics` array based on the `topicOrder` array.  
     * Iterate through the sorted list.  
     * `Topic[i].startTime` \= `MeetingStart` \+ `Sum(Topic[0]...Topic[i-1].duration)`.  
   * **Timezone:** Use `date-fns-tz` to format these calculated times into the user's local display time.

   ### **Step 6: Optimized Drag-and-Drop**

Implement the specific "Parent-Array" reordering logic.

1. **Create `components/meeting/agenda-board.tsx`:**  
   * Wrap the list in `<DndContext>` and `<SortableContext items={meeting.topicOrder}>`.  
   * **Optimistic UI:** On `dragEnd`, immediately reorder the local state to prevent visual snap-back.  
2. **Implement the Write Logic:**  
* When the drag ends, execute a **single Firestore write**:  
  TypeScript  
  updateDoc(meetingRef, {  
*   topicOrder: newOrderArray // e.g., \["id\_B", "id\_A", "id\_C"\]  
* });  
  *   
  * *Note:* Do NOT write to the individual topic documents. This is the optimization requested in the architecture.

  ### **Step 7: Topic CRUD & Soft Deletes**

Allow users to add content to the agenda.

1. **Add Topic:**  
   * Create a "Add Topic" button/form.  
   * On submit:  
     1. `addDoc` to `topics` sub-collection.  
     2. **Transactional Update:** Add the new `topicId` to the `meeting.topicOrder` array.  
2. **Edit/Delete Topic:**  
   * **Edit:** Update title/duration directly on the topic doc.  
   * **Soft Delete:** The delete button should NOT call `deleteDoc`. Instead, update the topic: `{ isDeleted: true }`.  
   * *Note:* The subscription hook in Step 4 already filters these out, so they will vanish from the UI instantly.

   ---

   ### **Phase 2 Validation Checklist**

* \[ \] I can create a new meeting, and it defaults to my current timezone.  
* \[ \] I can add 3 topics with different durations (e.g., 10m, 15m, 5m).  
* \[ \] The app automatically displays the correct start time for the 2nd and 3rd topics (e.g., 10:00, 10:10, 10:25).  
* \[ \] I can drag Topic 3 to the top, and the times instantly recalculate (Topic 3 becomes 10:00).  
* \[ \] Refreshing the page persists the new order.  
* 


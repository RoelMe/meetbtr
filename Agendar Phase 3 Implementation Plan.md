# Agendar Phase 3 Implementation Plan

Here is the step-by-step implementation guide for **Phase 3: The "Running" Mode (Real-Time)**.

**Goal:** By the end of this phase, the application will feel "alive." Users can join a room, see updates instantly, run the timer, and celebrate completion with confetti.

---

### **Step 1: Install Dependencies**

We need a library for the celebratory effects.

**Install Package:**  
Bash  
npm install canvas-confetti @types/canvas-confetti

1. 

### **Step 2: Security Rules Update (Guest Access)**

To allow guests and collaborators to edit notes and reorder topics, we need to open up the security rules.

**Update Firestore Rules:** Go to Firebase Console \-\> Firestore \-\> Rules and update `match /meetings/{meetingId}`:  
JavaScript  
match /meetings/{meetingId} {  
  // Allow creation by authenticated users  
  allow create: if request.auth \!= null;

  // Allow Read/Write if:  
  // 1\. User is Owner  
  // 2\. OR User has the Meeting ID (Public Link Access for MVP)  
  allow read, write: if true; 

  // Note: For a stricter MVP, check: request.resource.data.isArchived \== false  
}

match /meetings/{meetingId}/topics/{topicId} {  
  allow read, write: if true;  
}

1. Note: In Phase 5 (Hardening), we will make this stricter. For now, this enables the "Link Access" model.

### **Step 3: The "Heartbeat" Hook (`useMeetingTimer`)**

This is the core logic engine. It runs client-side but syncs with the server.

1. **Create `hooks/useMeetingTimer.ts`:**  
   * **Inputs:** `meeting` (with `startedAt`), `topics` (with `duration`), `topicOrder`.  
   * **Logic:**  
     * Create a `useEffect` that runs `setInterval` every 1000ms.  
     * Calculate `elapsedSeconds = (Date.now() - meeting.startedAt.toMillis()) / 1000`.  
     * Iterate through the ordered topics to find the **Active Topic**:  
       * *AccumulatedDuration* \< *ElapsedSeconds* \< *(AccumulatedDuration \+ TopicDuration)*.  
   * **Return:** `{ activeTopicId, secondsRemaining, isOvertime }`.  
   * **Handling Null:** If `meeting.startedAt` is null, return `activeTopicId: null` (Planning Mode).

### **Step 4: Meeting Controls & State Switch**

Implement the button that transitions the meeting from "Planning" to "Running".

1. **Update `components/meeting/meeting-header.tsx`:**  
   * Add a **"Start Meeting"** button.

**Action:**  
TypeScript  
updateDoc(meetingRef, {  
  status: "running",  
  startedAt: serverTimestamp() // critical for sync  
});

*   
  * **Effect:** This single write will trigger the `useMeetingTimer` hook on *all* connected clients simultaneously.

### **Step 5: The "Active Topic" Visualization**

Visually distinguish the current topic from the others.

1. **Update `components/meeting/draggable-topic-card.tsx`:**  
   * Accept props: `isActive`, `secondsRemaining`, `isOvertime`.  
   * **Styling:**  
     * If `isActive`: Add a blue border (`border-blue-500 ring-2`) and expand the accordion automatically.  
     * If `isActive`: Render the **Live Timer** in the header.  
   * **Timer Visuals:**  
     * Format `secondsRemaining` as `MM:SS`.  
     * If `isOvertime` (negative time): Make text **Red** and add a gentle CSS pulse animation.

### **Step 6: Collaborative Notes (Debounced)**

Allow multiple users to type without crashing the database or overwriting each other too aggressively.

1. **Create `components/ui/debounced-textarea.tsx`:**  
   * Standard `textarea` or `RichTextEditor`.  
   * **Logic:**  
     * Local state (`value`) updates instantly on keystroke.  
     * `useEffect` with a 500ms-1000ms timer waits for the user to stop typing before calling `updateDoc`.  
     * *Tip:* This prevents "jittery" updates for other users.  
2. **Integrate into Topic Card:**  
   * Connect this input to the `topics/{id}/notes` field.  
   * Add a small "Saved" indicator that appears when the debounce writes to Firestore.

### **Step 7: Gamification & Completion**

The "End Meeting" flow.

1. **Meeting Completion:**  
   * Add an **"End Meeting"** button to the header (visible only to Owner).

**Action:**  
TypeScript  
import confetti from 'canvas-confetti';

// ... inside handler  
await updateDoc(meetingRef, { status: "ended", isArchived: true });  
confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

*   
  * **Listener:** Add a `useEffect` in the `MeetingPage` that listens for `meeting.status === "ended"` to trigger confetti for *everyone*, not just the admin.

---

### **Phase 3 Validation Checklist**

* \[ \] Open the meeting in two different browser windows (Simulate User A and User B).  
* \[ \] User A clicks "Start Meeting"; User B instantly sees the timer start.  
* \[ \] As the timer counts down, both users see the same seconds remaining (within \~1s).  
* \[ \] Allow a topic to go overtime; verify the timer turns red for both users.  
* \[ \] User A types in the notes; User B sees the text appear after \~1 second (debounce).  
* \[ \] User A clicks "End Meeting"; User B sees the confetti explosion.


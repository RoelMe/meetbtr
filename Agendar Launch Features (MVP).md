## **Launch Features (MVP)**

### **Dynamic Agenda Engine & Timezone Core**

**Strong:** The heart of the app. It manages the agenda timeline, utilizing a parent-array structure for performant reordering and `date-fns-tz` for precise timezone handling.

* **Logic:** `Topic Start Time` \= `Meeting Start Time` \+ `Sum of Previous Topic Durations`.  
* **Timezone Intelligence:**  
  * Auto-detects creator's browser timezone (e.g., "America/New\_York") on setup.  
  * Stores all timestamps in UTC.  
  * Displays times in the viewer's local time, but allows the creator to "plan" relative to the meeting's native timezone.  
* **Reordering (Optimized):** Uses a `topicOrder` array (e.g., `['topicA', 'topicB']`) on the Meeting document. Drag-and-drop updates this single field, minimizing database writes.  
* **Soft Deletes:** Deleting topics checks a `isDeleted` flag rather than removing data.

#### **Tech Involved**

* **Frontend:** `date-fns-tz`, `@dnd-kit/core`, `@dnd-kit/sortable`.  
* **Data:** Firestore (using Composite Indexes for `isDeleted` queries).

#### **Main Requirements**

* Must handle "Daylight Savings" boundaries correctly.  
* Optimistic UI updates for zero-latency drag-and-drop.

### **Gated Creation & Dashboard (Freemium)**

**Strong:** The user's command center. Enforces subscription limits for creators while ensuring a seamless, low-friction entry for collaborators.

* **Creation Gate:** Sign Up/Sign In required to create.  
* **Tier Enforcement:**  
  * **Free:** Max 3 active meetings (count excludes archived/deleted).  
  * **Paid:** Unlimited.  
* **Guest Access:** Non-authenticated users can join via link but must enter a "Display Name" (stored in local storage/session) to collaborate.  
* **Meeting Archive:**  
  * "End/Archive Meeting" button moves the meeting to a "Past Meetings" tab.  
  * Archived meetings become Read-Only (enforced by DB rules).

#### **Tech Involved**

* **Auth:** Firebase Auth (Google \+ Email/Pass).  
* **State:** Tabs component (Radix UI) for "Upcoming" vs. "Past".  
* **Search:** Client-side Fuse.js filtering.

#### **Main Requirements**

* Secure database rules: `allow create: if request.auth != null`.  
* Guest users must have "Write" access to topics if they possess the valid Meeting ID.

### **Multiplayer Collaboration & Running Mode**

**Strong:** The "room" experience where the agenda becomes a live, synchronized tool.

* **Real-time Sync:** Changes to `topicOrder`, topic details, or notes reflect instantly via Firestore snapshots.  
* **Running State:** A global "Start" button switches the UI to "Running Mode" for all connected clients.  
* **Timer Authority:** Logic runs client-side, but syncs against a stored `startedAt` timestamp to ensure all users see the same countdown.  
* **Active Topic Indicator:** Automatically highlights the current topic based on elapsed time.  
* **Live Timer:** Displays "MM:SS remaining" for the specific topic. Turns red and negative if overtime.  
* **Inline Notes:** A synchronized Rich Text area within each topic for minutes/decisions.  
* **Confetti/Completion:** Visual celebration on meeting end or topic completion.  
* **Optimization:** Debounce text inputs (500ms \- 2s) to prevent write-heavy spikes.

#### **Tech Involved**

* **Database:** Firestore Snapshot Listeners.  
* **Logic:** `useInterval` hook for the heartbeat; "Last Write Wins" for text conflicts.  
* **Visuals:** `canvas-confetti`.

---

## **Future Features (Post-MVP)**

### **AI Meeting Assistant (Paid)**

* **Function:** "Generate Summary" button processing "Notes" fields into Action Items.  
* **Tech:** OpenAI API via Firebase Functions.

### **Deep Calendar Integration**

* **Function:** Two-way sync with Google/Outlook Calendars (OAuth2).

### **Link Recovery**

* **Function:** Email-based recovery for anonymous collaborators to regain access.

---

## **System Diagram**

**Component Breakdown:**

1. **Client (Next.js/React):**  
   * **Dashboard Page:** Fetches user's meetings, handles client-side search, checks "3 Meeting Limit".  
   * **Meeting Room:** Connects to Firestore `onSnapshot`. Handles `dnd-kit` logic, Timezone conversions (`date-fns-tz`), and the `useInterval` heartbeat.  
2. **Auth (Firebase Auth):**  
   * Handles Anonymous \-\> Permanent Account upgrades.  
3. **Data Layer (Firestore):**  
   * **Collection `users`:** Stores profile, subscription status (`free` vs `premium`), and stripeCustomerId.  
   * **Collection `meetings`:** Stores meeting meta (title, date, timezone, ownerID, status, `topicOrder` array).  
   * **Collection `topics` (Sub-collection):** Stores agenda items and notes.  
   * **Soft Deletes:** All queries include `.where("isDeleted", "!=", true)`.  
4. **Billing & Serverless (Stripe \+ Firebase Functions):**  
   * **Checkout:** Client redirects to Stripe.  
   * **Webhook:** Stripe talks to Firebase Functions \-\> Updates `users` document.  
   * **API:** Next.js API routes used for generating `.ics` files.

---

## **Questions & Clarifications**

* **Search Scalability:** MVP uses client-side filtering (Fuse.js).  
* **Timer Authority:** Anyone invited can start the meeting.  
* **Anonymous Data:** Link recovery is a backlog item; MVP assumes lost session \= lost access for anonymous users.  
* **Stripe Model:** Free \= 3 meetings (creation only); Paid \= Unlimited \+ AI/Advanced features.  
* **Archive:** Past meetings are Read-Only (DB enforced).  
* **Guest Persistence:** LocalStorage used to remember Guest Name.

## **List of Architecture Consideration Questions**

* **Firestore Writes:** Strategy \= Debounce text inputs & Update parent array for reordering.  
* **Meeting State:** Stored in DB (`startedAt`, `status`) to sync "Running" view for all.  
* **Timezones:** Supported via `date-fns-tz` (stored as UTC, displayed Local).  
* **Conflict Resolution:** Last Write Wins (MVP).  
* **Soft Deletes:** Implemented with `isDeleted` flag.


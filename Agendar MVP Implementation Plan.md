### **Agendar MVP Implementation Plan**

This roadmap prioritizes the complex "Time & Sync" logic first to ensure the core value proposition is solid before building surrounding administrative features.

---

### **Phase 1: The Skeleton & Authentication**

**Focus:** Project initialization, infrastructure setup, and user identity. **Goal:** A deployed Next.js app where users can sign up, log in (or enter as Guest), and land on a secure empty page.

**Key Deliverables:**

* **Tech Stack Init:** Next.js 14 (App Router), React 19, Tailwind CSS, and Shadcn UI setup.  
* **Firebase Config:** Initialize Auth and Firestore (Client SDK \+ Admin SDK).  
* **Authentication:**  
  * Google Provider \+ Email/Password for Creators.  
  * **Guest Handling:** Utilities to store/retrieve a "Guest Display Name" from `localStorage`.  
* **Layouts:** Global Navbar with User Profile (Avatar/Sign Out) and logical route groups (`(auth)`, `(dashboard)`, `meeting/[id]`).  
* **Base Security:** Initial Firestore rules allowing `read/write` for authenticated users on their own documents.

  ---

  ### **Phase 2: The Agenda Builder (Core Logic)**

**Focus:** The "Planning" mode. This is the technical core involving drag-and-drop, timezone math, and data structuring. **Goal:** A user can create a meeting, add topics, reorder them via drag-and-drop, and see start times update instantly while respecting timezones.

**Key Deliverables:**

* **Data Model:** Implementation of `meetings` collection and `topics` sub-collection.  
* **Create Meeting Form:** Inputs for Title, Date, and **Timezone Selection** (defaulting to creator's browser time).  
* **Timezone Engine:** Integration of `date-fns-tz` to store times in UTC but display in the user's local time.  
* **Optimized Drag-and-Drop:**  
  * Implementation of `@dnd-kit`.  
  * **Parent-Array Logic:** Reordering updates the `meeting.topicOrder` array (one write) instead of rewriting all topic documents.  
* **Topic CRUD:** Add/Edit/Delete topics with **Soft Delete** logic (toggling `isDeleted: true`).

  ---

  ### **Phase 3: The "Running" Mode (Real-Time)**

**Focus:** The "Multiplayer" experience and live meeting tools. **Goal:** The app feels "alive." Users can join a room, see updates instantly, run the timer, and celebrate completion.

**Key Deliverables:**

* **Real-time Listeners:** Firestore `onSnapshot` hooks to sync `topicOrder`, `status`, and `notes` across all clients.  
* **The Heartbeat Engine:**  
  * **Timer Authority:** `useInterval` hook calculating remaining time based on the server-stored `startedAt` timestamp.  
  * **Active Topic:** Derived state logic to highlight the current topic based on elapsed time.  
* **Gamification:**  
  * **Live Timer:** Visual countdown (Red/Pulsing on overtime).  
  * **Confetti:** Integration of `canvas-confetti` to trigger on "End Meeting".  
* **Collaborative Notes:** Rich Text inputs with **Debounced Saving** (500ms-2s) and "Last Write Wins" logic.  
* **Guest Access:** Logic allowing non-auth users to join and edit `notes` if they possess a valid Meeting ID.

  ---

  ### **Phase 4: Dashboard & Organization**

**Focus:** Management, navigation, and portfolio handling. **Goal:** Users can manage their meetings, search effectively, and access historical records.

**Key Deliverables:**

* **Dashboard UI:** Tabbed view for "Upcoming" vs. "Past" meetings.  
* **Smart Search:** Client-side Fuse.js implementation to filter meetings by title or owner.  
* **Archive Flow:**  
  * Logic to transition a meeting to `status: "ended"`.  
  * **Read-Only Enforcement:** Firestore rules preventing writes if `isArchived == true`.  
* **Soft Delete Management:** updating dashboard queries to filter out `isDeleted == true` items.  
* **Export:** API route to generate and download `.ics` calendar files.

  ---

  ### **Phase 5: Monetization & Launch Prep**

**Focus:** Gating features, payments, and production hardening. **Goal:** The app generates revenue and is secure for public launch.

**Key Deliverables:**

* **Stripe Integration:**  
  * Checkout implementation for upgrades.  
  * Customer Portal link for subscription management.  
* **Limit Enforcement:**  
  * Middleware/Logic to check `count(meetings)` before creation.  
  * Enforce "Max 3 Active Meetings" for Free tier (Creation only; Collaboration is unlimited).  
* **Security Hardening:** Final review of Firestore Rules (Guest permissions, Soft Delete indexing).  
* **Analytics:** Google Analytics and Metadata setup for SEO.  
  * 


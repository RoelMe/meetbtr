# README

Markdown

\# Agendar \- Collaborative Meeting Agenda Manager

Agendar is a real-time, multiplayer meeting agenda tool designed to replace static documents with dynamic, time-aware workspaces. It features automatic time calculations, drag-and-drop reordering, and a "Running Mode" that keeps meetings on track with live timers.

\#\# 🚀 Features

\#\#\# Core MVP  
\* **\*\*Dynamic Scheduling:\*\*** Automatically calculates start times based on topic duration and drag-and-drop order.  
\* **\*\*Multiplayer Sync:\*\*** Real-time updates for all attendees using Firebase Firestore listeners.  
\* **\*\*Running Mode:\*\*** A "Heartbeat" engine that highlights the active topic and displays a live countdown timer during the meeting.  
\* **\*\*Collaborative Notes:\*\*** Rich text note-taking with debounced saving to prevent conflicts.  
\* **\*\*Freemium Model:\*\*** Gated creation for free users (max 3 meetings), unlimited collaboration for everyone.  
\* **\*\*Smart Dashboard:\*\*** Searchable history with "Upcoming" and "Past" views.

\#\#\# Architecture  
\* **\*\*Frontend:\*\*** Next.js latest stable version (App Router), React 19, Tailwind CSS, Shadcn UI.  
\* **\*\*Database:\*\*** Firebase Firestore (NoSQL) with optimized "Parent-Array" data structure for cost-effective reordering.  
\* **\*\*Auth:\*\*** Firebase Auth (Google \+ Anonymous).  
\* **\*\*Payments:\*\*** Stripe Checkout & Customer Portal.  
\* **\*\*State Management:\*\*** React Context \+ Optimistic UI updates.

\---

\#\# 🛠 Tech Stack

| Component | Technology | Reasoning |  
| :--- | :--- | :--- |  
| **\*\*Framework\*\*** | Next.js latest stable release | App Router for layout handling; Server Components for Dashboard performance. |  
| **\*\*Language\*\*** | TypeScript | Strict typing for complex meeting state logic. |  
| **\*\*Styling\*\*** | Tailwind \+ Shadcn | Rapid UI development with accessible primitives. |  
| **\*\*Database\*\*** | Firestore | Native real-time listeners (\`onSnapshot\`) for multiplayer features. |  
| **\*\*Drag & Drop\*\*** | @dnd-kit | Accessible, performant drag-and-drop primitives. |  
| **\*\*Time Handling\*\*** | date-fns-tz | Accurate timezone handling for remote teams. |  
| **\*\*Payments\*\*** | Stripe | Secure subscription handling and checkout. |

\---

\#\# 🏗 Project Structure

\`\`\`text  
/  
├── app/                        \# Next.js App Router  
│   ├── (auth)/                 \# Login & Signup Routes  
│   ├── (dashboard)/            \# Protected User Dashboard  
│   ├── meeting/\[id\]/           \# The Active Meeting Room  
│   └── api/                    \# Server-side routes (Stripe Webhooks)  
├── components/  
│   ├── dashboard/              \# Dashboard-specific UI  
│   ├── meeting/                \# Agenda Board, Timer, & Controls  
│   └── ui/                     \# Shared Shadcn primitives  
├── lib/  
│   ├── firebase/               \# Firebase Admin & Client Config  
│   └── utils.ts                \# Helpers (CN, Formatters)  
├── hooks/  
│   ├── useMeeting.ts           \# Firestore Subscription Hook  
│   └── useMeetingTimer.ts      \# The "Heartbeat" Logic Hook  
└── types/                      \# TS Interfaces (Meeting, Topic, User)

---

## **⚡ Getting Started**

### **Prerequisites**

* Node.js 18+  
* A Firebase Project (Blaze Plan recommended for Cloud Functions, but Free works for MVP).  
* A Stripe Account (for payments).

### **Installation**

1. **Clone the repository:**  
2. Bash

git clone \[https://github.com/yourusername/agendar.git\](https://github.com/yourusername/agendar.git)  
cd agendar

3.   
4.   
5. **Install dependencies:**  
6. Bash

npm install

7.   
8.   
9. Environment Setup:  
   Create a .env.local file in the root:  
10. Code snippet

\# Firebase Client  
NEXT\_PUBLIC\_FIREBASE\_API\_KEY=...  
NEXT\_PUBLIC\_FIREBASE\_AUTH\_DOMAIN=...  
NEXT\_PUBLIC\_FIREBASE\_PROJECT\_ID=...

\# Stripe (Public)  
NEXT\_PUBLIC\_STRIPE\_PUBLISHABLE\_KEY=pk\_test\_...  
NEXT\_PUBLIC\_BASE\_URL=http://localhost:3000

\# Server Side Keys (Do not expose)  
STRIPE\_SECRET\_KEY=sk\_test\_...  
STRIPE\_WEBHOOK\_SECRET=whsec\_...

11.   
12.   
13. **Run Development Server:**  
14. Bash

npm run dev

15.   
16. 

---

## **💾 Database Schema (Firestore)**

**Collection: meetings**

* title: string  
* ownerId: string  
* status: "planning" | "running" | "ended"  
* topicOrder: string\[\] (Array of Topic IDs for ordering)  
* startedAt: timestamp (Source of truth for timer)

**Sub-Collection: meetings/{id}/topics**

* title: string  
* duration: number (minutes)  
* notes: string (HTML/Markdown)  
* isCompleted: boolean

---

## **🔐 Security Rules**

We use a "Link Access" model for MVP simplicity, with strict Owner controls.

* **Read:** Public (if you have the Meeting ID).  
* **Write (Owner):** Full access.  
* **Write (Guest):** Can update topicOrder and notes only if guestAccess is true.  
* **Archive:** No writes allowed if isArchived \== true.

---

## **🚢 Deployment**

**Vercel (Recommended):**

1. Push to GitHub.  
2. Import project in Vercel.  
3. Add the Environment Variables from .env.local.  
4. Deploy.

Firestore Indexes:

Check your browser console during development. Firestore will provide links to auto-create required Composite Indexes (e.g., querying ownerId \+ isDeleted).

---

## **📄 License**

This project is licensed under the MIT License.


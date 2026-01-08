Based on the latest architectural decisions—specifically the **Heartbeat Engine**, **Soft Deletes**, and **Freemium logic**—here is the updated and finalized **Firestore Data Schema**.

### **Agendar Firestore Data Schema**

#### **1\. Collection: `users`**

Contains user profiles and subscription status.

* **Logic Change:** Removed the denormalized `meetingsCreatedCount` counter. To strictly enforce the "3 Active Meetings" limit for free users, we will use a [Firestore Count Query](https://firebase.google.com/docs/firestore/query-data/aggregation-queries) (`where("ownerId", "==", uid).where("isDeleted", "==", false).where("isArchived", "==", false).count()`) at the application level to avoid sync errors.  
  JSON  
1. // Document ID: \<Firebase Auth UID\>  
2. {  
3.   "displayName": "Sarah Engineer",  
4.   "email": "sarah@company.com",  
5.   "photoURL": "https://lh3.googleusercontent.com/...",  
6.   "createdAt": "2023-10-24T10:00:00Z", // ISO String  
7.   "tier": "free", // "free" | "premium"  
8.   "stripeCustomerId": "cus\_123456"  
9. }  
   

   #### **2\. Collection: `meetings`**

The parent container. This document is the "Source of Truth" for the meeting's **Time**, **Order**, and **Status**.

JSON

10. // Document ID: \<Auto Generated\>  
11. {  
12.   "ownerId": "user\_123",  
13.   "title": "Weekly Design Sync",  
14.     
15.   // Status Logic:  
16.   // "planning" \= Edit mode.  
17.   // "running"  \= Read-only for structure, but editable for notes/checkboxes.  
18.   // "ended"    \= Triggers Confetti.  
19.   "status": "planning", // "planning" | "running" | "ended"  
20.   
21.   // Timing & Timezones:  
22.   "scheduledAt": "2023-10-25T14:00:00Z", // UTC (Planned Start)  
23.   "timezone": "America/New\_York",        // Creator's Browser Timezone (for display calculation)  
24.     
25.   // THE HEARTBEAT SOURCE OF TRUTH:  
26.   // When "Start Meeting" is clicked, this is set to serverTimestamp().  
27.   // The client uses this to calculate (Now \- startedAt) for the Timer.  
28.   "startedAt": null,   
29.   
30.   // THE ORDERING ENGINE:  
31.   // We store Topic IDs here. Drag-and-drop updates ONLY this array.  
32.   // This minimizes writes (1 write vs N writes) and latency.  
33.   "topicOrder": \["topic\_A", "topic\_B", "topic\_C"\],  
34.   
35.   // Access Control & Soft Delete:  
36.   "isDeleted": false, // Soft Delete (Recoverable)  
37.   "isArchived": false, // If true, strictly Read-Only via Security Rules  
38.   "guestAccess": true // Toggle to allow/block non-auth users with the link  
39. }  
    

    #### **3\. Sub-Collection: `meetings/{meetingId}/topics`**

The actual content. Stored as a sub-collection to avoid the 1MB document size limit of the parent.

JSON

40. // Document ID: \<topic\_A\> (Must match ID in parent topicOrder)  
41. {  
42.   "title": "Review Q3 Metrics",  
43.   "duration": 15, // in minutes (Used to calculate "Projected Start Time")  
44.   "type": "presentation", // "presentation" | "discussion" | "workshop" | "break"  
45.   
46.   // Rich Text / Content:  
47.   "description": "\<p\>Reviewing the Figma files...\</p\>", // Context for the agenda item  
48.     
49.   // REAL-TIME NOTES:  
50.   // This field supports concurrent edits via "Last Write Wins" (Debounced).  
51.   "notes": "\<ul\>\<li\>Decision made: Launch on Friday\</li\>\</ul\>",  
52.   
53.   // State:  
54.   "isCompleted": false, // Triggers "Checkmark" animation  
55.     
56.   // Attachments:  
57.   "links": \[  
58.     { "title": "Figma", "url": "https://figma.com/..." }  
59.   \],  
60.   
61.   // Soft Delete:  
62.   // Topics are hidden from the UI if true, but remain in DB.  
63.   "isDeleted": false  
64. }  
    

    ### **Schema & Architecture Alignment**

1. **Ordering Strategy (`topicOrder`):**  
   * **Reasoning:** Moving a card in a list of 20 items is expensive if each item stores its own `index`. By storing the order in the parent `topicOrder` array, a drag-and-drop action is a **single document write** to the `meetings` doc.  
2. **Heartbeat Engine (`startedAt`):**  
   * **Reasoning:** We do not store "current timer value" in the DB (too many writes). We store the **Start Time**. Every client calculates `Date.now() - startedAt` locally to render the countdown ticker. This ensures perfect sync without slamming the database.  
3. **Soft Deletes (`isDeleted`):**  
   * **Reasoning:** Allows for "Undo" functionality and prevents accidental data loss. Queries must always include `.where("isDeleted", "==", false)`.  
4. **Guest Access:**  
   * **Reasoning:** Guests do not have `users` documents. Their permissions are derived from possessing the `meetingId` and the `guestAccess: true` flag on the meeting document. Their "Display Name" is transient (client-side only) and included in `notes` updates if we implement a "User X wrote..." feature later.

   


# Agendar Implementation Plan Phase 1

Here is the step-by-step implementation guide for **Phase 1: The Skeleton & Authentication**.

**Goal:** By the end of this phase, you will have a deployed Next.js application where users can sign up, log in (or enter as Guest), and land on a secure empty page.

---

### **Step 1: Project Initialization**

Initialize the Next.js project with the required stack settings.

**Run the creator command:**  
Bash  
npx create-next-app@latest agendar \--typescript \--tailwind \--eslint

**Select the following options** when prompted:

* Use `src/` directory? **No**  
  * Use App Router? **Yes**  
  * Customize the default import alias? **No** (Keep `@/*`)

  **Clean up the boilerplate:**

  * Delete the default content in `app/page.tsx` and replace it with a simple `<h1>Agendar Landing</h1>`.  
  * Clear out non-essential styles in `app/globals.css` (keep Tailwind directives).

  ### **Step 2: UI & Styling Setup (Shadcn UI)**

We will use Shadcn UI for our component primitives.

**Initialize Shadcn:**  
Bash  
npx shadcn@latest init

* Style: **New York**  
  * Base Color: **Slate**  
  * CSS Variables: **Yes**

  **Install core UI components** needed for the layout:  
    Bash  
    npx shadcn@latest add button avatar dropdown-menu input label tabs card dialog


  ### **Step 3: Firebase Configuration**

Set up the connection between your Next.js app and Firebase.

1. **Install SDKs:**  
   Bash  
   npm install firebase  
   **Create the configuration file:**  
   * Create `lib/firebase/config.ts`.  
   * Paste your Firebase Web App configuration (API Key, Auth Domain, Project ID) from the Firebase Console.  
   * Export the initialized `app`, `auth`, and `db` (Firestore) instances.  
2. TypeScript  
   // lib/firebase/config.ts  
3. import { initializeApp, getApps, getApp } from "firebase/app";  
4. import { getAuth } from "firebase/auth";  
5. import { getFirestore } from "firebase/firestore";  
6.   
7. const firebaseConfig \= {  
8.   apiKey: process.env.NEXT\_PUBLIC\_FIREBASE\_API\_KEY,  
9.   authDomain: process.env.NEXT\_PUBLIC\_FIREBASE\_AUTH\_DOMAIN,  
10.   projectId: process.env.NEXT\_PUBLIC\_FIREBASE\_PROJECT\_ID,  
11.   // ...other config keys  
12. };  
13.   
14. // Singleton pattern to prevent multiple initializations  
15. const app \= \!getApps().length ? initializeApp(firebaseConfig) : getApp();  
16. const auth \= getAuth(app);  
17. const db \= getFirestore(app);  
18.   
19. export { app, auth, db };  
2.   
3. **Environment Variables:**  
   * Create `.env.local` and add your keys (`NEXT_PUBLIC_FIREBASE_API_KEY`, etc.).

   ### **Step 4: Authentication Context & Hooks**

Create a global provider to handle user state across the app.

1. **Create `hooks/useAuth.ts`:**  
   * Use Firebase's `onAuthStateChanged` listener to track the current user.  
   * Expose `user`, `loading`, `signInWithGoogle`, and `signOut` methods.  
2. **Create `components/providers/auth-provider.tsx`:**  
   * Wrap your application with this Context Provider so the navbar and protected routes can access user state.  
3. **Implement Guest Handling Utility:**  
   * Create a utility in `lib/utils.ts` or `hooks/useGuest.ts` to manage anonymous users.  
   * **Logic:** Check `localStorage` for a `guestDisplayName`. If missing, return `null` (prompting them to enter a name later).

   ### **Step 5: Layouts & Routing Structure**

Organize the application logic using Route Groups.

1. **Create Directory Structure:**  
   * `app/(auth)/login/page.tsx`: The Login/Signup page.  
   * `app/(dashboard)/layout.tsx`: Layout for logged-in users (includes the Sidebar/Top Nav).  
   * `app/(dashboard)/page.tsx`: The main "My Meetings" dashboard.  
   * `app/meeting/[id]/page.tsx`: The future meeting room (leave as a placeholder for now).  
2. **Build the Global Navbar (`components/shared/navbar.tsx`):**  
   * **Left:** Logo ("Agendar").  
   * **Right:**  
     * If `user` exists: Show `UserAvatar` with a Dropdown Menu (Profile, Sign Out).  
     * If `!user`: Show "Sign In" button.  
3. **Update Root Layout (`app/layout.tsx`):**  
   * Import and wrap `children` with your `AuthProvider`.  
   * Place the `Navbar` at the top.

   ### **Step 6: Base Security Rules**

Deploy the initial security layer to Firestore.

1. **Go to Firebase Console \-\> Firestore \-\> Rules.**  
20. **Add basic owner-only rules**:  
    JavaScript  
    rules\_version \= '2';  
21. service cloud.firestore {  
22.   match /databases/{database}/documents {  
23.     // Users can only read/write their own profile  
24.     match /users/{userId} {  
25.       allow read, write: if request.auth \!= null && request.auth.uid \== userId;  
26.     }  
27.   
28.     // Meetings: Creators have full access  
29.     // (We will expand this for Guests in Phase 3\)  
30.     match /meetings/{meetingId} {  
31.       allow create: if request.auth \!= null;  
32.       allow read, write: if request.auth \!= null && resource.data.ownerId \== request.auth.uid;  
33.     }  
34.   }  
35. }  
2.   
   ---

   ### **Phase 1 Validation Checklist**

Before moving to Phase 2, verify the following:

* \[ \] You can run `npm run dev` without errors.  
* \[ \] You can click "Sign In" and authenticate via Google.  
* \[ \] After login, your Google Avatar appears in the Navbar.  
* \[ \] You can navigate to `/login` and `/dashboard`.  
* \[ \] A "Guest" user can visit the site without crashing the auth logic.



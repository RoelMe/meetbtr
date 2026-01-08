# Agendar implementation guide for **Phase 5: Monetization & Security**.

Here is the step-by-step implementation guide for **Phase 5: Monetization & Launch Prep**.

**Goal:** By the end of this phase, the application will enforce usage limits, securely process payments via Stripe, and be hardened for production deployment.

---

### **Step 1: Install & Configure Stripe**

Set up the payment infrastructure.

1. **Install Library:**  
   Bash  
   npm install stripe  
1.   
2. **Environment Variables:** Update your `.env.local` with the keys from your Stripe Dashboard (Developer \> API keys).  
   Code snippet  
   STRIPE\_SECRET\_KEY=sk\_test\_...  
3. STRIPE\_WEBHOOK\_SECRET=whsec\_... (You will get this in Step 4\)  
4. NEXT\_PUBLIC\_STRIPE\_PUBLISHABLE\_KEY=pk\_test\_...  
5. NEXT\_PUBLIC\_BASE\_URL=http://localhost:3000  
2.   
3. **Initialize Stripe:** Create `lib/stripe/index.ts` to export the Stripe instance.

   ### **Step 2: Enforcing the Free Tier Limit**

Implement the "Gatekeeper" logic before allowing a meeting creation.

1. **Create `lib/subscription.ts`:**  
   * **Function:** `checkMeetingLimit(userId)`  
   * **Logic:**  
     1. Fetch the user's profile to check `tier`.  
     2. If `tier === 'premium'`, return `true` (Allowed).  
6. If `tier === 'free'`, run a **Count Query**:  
   TypeScript  
   const coll \= collection(db, "meetings");  
7. const q \= query(  
8.   coll,   
9.   where("ownerId", "==", userId),  
10.   where("isDeleted", "==", false),  
11.   where("isArchived", "==", false)  
12. );  
13. const snapshot \= await getCountFromServer(q);  
14. return snapshot.data().count \< 3;  
    3.   
2. **Update "Create Meeting" Modal:**  
   * Call this check *before* calling `addDoc`.  
   * If it returns `false`, open a **"Upgrade to Pro"** modal instead of creating the meeting.

   ### **Step 3: Stripe Checkout Flow**

Allow users to pay to upgrade.

1. **Create API Route `app/api/stripe/checkout/route.ts`:**  
   * **Method:** `POST` (Requires Auth).  
   * **Logic:**  
     * Create a Stripe Checkout Session.  
     * `mode: 'subscription'`.  
     * `success_url`: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`.  
     * `cancel_url`: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?canceled=true`.  
     * `metadata`: `{ userId: currentUser.uid }` (Critical for the webhook).  
   * **Return:** `{ url: session.url }`.  
2. **Frontend Integration:**  
   * In the "Upgrade to Pro" modal, the "Subscribe" button calls this API and redirects `window.location.href` to the returned URL.

   ### **Step 4: The Webhook (Syncing Stripe \-\> Firebase)**

Securely update the user's tier when payment succeeds.

1. **Create API Route `app/api/webhooks/stripe/route.ts`:**  
   * **Important:** This route needs the **raw request body** to verify the signature. Next.js App Router requires specific handling for this (using `request.text()` or a buffer utility).  
   * **Logic:**  
     1. Verify signature using `stripe.webhooks.constructEvent`.  
     2. Switch on `event.type`.  
     3. **Case `checkout.session.completed`:**  
        * Extract `userId` from `session.metadata`.  
        * Extract `customerId` from `session.customer`.  
        * Update Firestore `users/{userId}`: `{ tier: 'premium', stripeCustomerId: customerId }`.  
     4. **Case `customer.subscription.deleted`:**  
        * Find user by `stripeCustomerId`.  
        * Update Firestore: `{ tier: 'free' }`.  
2. **Testing:**  
   * Use the Stripe CLI to forward events locally: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

   ### **Step 5: Customer Portal**

Allow users to cancel or manage their subscription.

1. **Create API Route `app/api/stripe/portal/route.ts`:**  
   * **Method:** `POST`.  
   * **Logic:**  
     * Get `user.stripeCustomerId` from Firestore.  
     * Create a Portal Session: `stripe.billingPortal.sessions.create({ customer: stripeCustomerId, return_url: ... })`.  
   * **Return:** `{ url: session.url }`.  
2. **Frontend:**  
   * In the Navbar User Dropdown, add a **"Manage Subscription"** item (visible only if `tier === 'premium'`).  
   * Clicking it calls this API and redirects.

   ### **Step 6: Production Hardening**

Final checks before going live.

1. **Google Analytics:**  
   * Install `@next/third-parties`.  
   * Add `<GoogleAnalytics gaId="..." />` to `app/layout.tsx`.  
2. **Firestore Indexes:**  
   * Check your browser console. You will likely see error links for the "Compound Queries" used in the Dashboard (e.g., `ownerId` \+ `isDeleted` \+ `isArchived`).  
   * Click the links to build these indexes in Firebase.  
3. **Security Rules Final Review:**  
   * Ensure `users` collection is not publicly readable.  
   * Ensure `isArchived` meetings are effectively read-only.

   ---

   ### **Phase 5 Validation Checklist**

* \[ \] **Free Limit:** Create 3 meetings. Try to create a 4th. Verify the "Upgrade" modal appears.  
* \[ \] **Checkout:** Click "Upgrade", complete a test payment (using Stripe test card `4242...`).  
* \[ \] **Webhook:** Verify in Firestore that your user document now says `tier: "premium"`.  
* \[ \] **Unlock:** Verify you can now create a 4th meeting.  
* \[ \] **Portal:** Click "Manage Subscription" and verify you land on the Stripe-hosted page.  
* \[ \] **Cancel:** Cancel the sub in the portal. Verify Firestore eventually updates `tier` back to `"free"`.  
15. 
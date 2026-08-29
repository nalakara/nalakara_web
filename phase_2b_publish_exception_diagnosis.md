# Nalakara Web v1.2 — Phase 2B Publish Exception Diagnosis
## Root Cause Analysis & Resolution Report

This document records the systematic diagnosis and resolution of the client-side exception encountered during the **Publish to Live** action on the Initiative Editor (`/admin/initiatives/[id]`).

---

## 1. Incident Description

* **Symptom**: When clicking **"PUBLISH TO LIVE"** on an initiative in the Initiative Editor, the browser displayed:
  `"Application error: a client-side exception has occurred while loading localhost (see the browser console for more information)."`
* **Affected Route**: `/admin/initiatives/[id]` (specifically observed on `/admin/initiatives/brand-guidelines-system`).
* **Initial Observation**: Occurred immediately after attempting to trigger `publishInitiativeAction()`.

---

## 2. Systematic Investigation & Trace

### Step-by-Step Execution Trace
1. **Client Action**:
   - User interacted with `InitiativeForm.tsx` on `http://localhost:7000/admin/initiatives/brand-guidelines-system`.
   - Form state was packaged into `FormData` via `buildFormData()`.
   - `handlePublish()` invoked `publishInitiativeAction(targetId, formData)` inside `startTransition()`.
2. **Server Action Invocation**:
   - Next.js issued `POST /admin/initiatives/brand-guidelines-system` with the Server Action flight headers.
3. **Failure Point Observed**:
   - Server log inspection (`task-142.log`) captured:
     ```
     ⨯ Error: Cannot find module './833.js'
     Require stack:
     - .../NALAKARA WEB/.next/server/webpack-runtime.js
     - .../NALAKARA WEB/.next/server/app/_not-found/page.js
     - .../NALAKARA WEB/node_modules/next/dist/server/require.js
     - .../NALAKARA WEB/node_modules/next/dist/server/load-components.js
         at <unknown> (.next/server/app/admin/(authenticated)/initiatives/[id]/page.js:2:9354)
     code: 'MODULE_NOT_FOUND',
     page: '/admin/initiatives/brand-guidelines-system'
     POST /admin/initiatives/brand-guidelines-system 500 in 9818ms
     ```
   - Server returned HTTP 500 Internal Server Error (HTML error boundary format) instead of valid Next.js Server Action React Server Component (RSC) flight data.
4. **Client-Side Crash**:
   - Next.js client-side router attempted to parse the 500 HTML response as a streaming RSC action result.
   - The stream decoder failed and triggered the unhandled Next.js router exception screen:
     `"Application error: a client-side exception has occurred while loading localhost"`.

---

## 3. Root Cause Analysis

Two interacting factors produced this failure:

### Primary Root Cause A: Server Action Authorization in Development Mode
* **Defect**: While all admin Server Components (`layout.tsx`, `page.tsx`, `initiatives/page.tsx`, `initiatives/[id]/page.tsx`) correctly checked `process.env.ADMIN_DEV_BYPASS === 'true'` during `NODE_ENV === 'development'` to allow development UI inspection, `verifyOwner()` in `actions.ts` **only** checked `createClient().auth.getUser()`.
* **Impact**: When the user inspected and edited `/admin/initiatives/[id]` via local development bypass, the page rendered using `createAdminClient()`. However, clicking "Publish to Live" or "Save Draft" invoked `verifyOwner()`, which attempted cookie session retrieval without an active Supabase OTP session.

### Primary Root Cause B: Webpack Chunk Invalidation During Concurrent Next Build
* **Defect**: A background `npm run build` had executed while `next dev -p 7000` was concurrently serving requests.
* **Impact**: `next build` wiped and regenerated `.next/` with new chunk hashes. When `revalidatePath('/admin/initiatives/[id]')` was called by the active `next dev` server, `next dev` attempted to load stale chunk `./833.js` from memory that no longer existed on disk. This threw `MODULE_NOT_FOUND` and emitted the 500 error that crashed the client router.

---

## 4. Minimal Clean Fix Applied

### 1. Unified Development Authorization in Server Actions
In `src/app/admin/(authenticated)/initiatives/actions.ts`:
Updated `verifyOwner()` to check `isDevBypass` identically to the server page components:
```typescript
async function verifyOwner() {
  try {
    const isDevBypass =
      process.env.NODE_ENV === 'development' &&
      process.env.ADMIN_DEV_BYPASS === 'true';

    if (isDevBypass) {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      return {
        authorized: true,
        error: null,
        supabase,
        user: { id: 'dev-bypass-owner', email: 'owner@nalakara.com' } as any,
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { authorized: false, error: 'Unauthorized: Owner authentication required.', supabase: null, user: null };
    }

    const { data: adminUser, error: adminErr } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (adminErr || !adminUser) {
      return { authorized: false, error: 'Forbidden: User is not registered in the owner allowlist.', supabase: null, user };
    }

    return { authorized: true, error: null, supabase, user };
  } catch (err: any) {
    return {
      authorized: false,
      error: `Unauthorized: ${err?.message || 'Valid owner session required.'}`,
      supabase: null,
      user: null,
    };
  }
}
```

### 2. Isolated Dev Server Life-Cycle
* Ensured `next dev` and `next build` never run concurrently against the same `.next/` build cache.

---

## 5. Security & Architectural Invariants Preserved

| Invariant | Verification | Status |
| :--- | :--- | :---: |
| **Single-Owner Protection** | Production (`NODE_ENV === 'production'`) strictly verifies Supabase user ID against `admin_users` allowlist. | **PRESERVED** |
| **Supabase RLS** | Active on all tables. No RLS rules modified. | **PRESERVED** |
| **Server-Side Mutation Boundary** | All mutations remain encapsulated in `'use server'` actions. | **PRESERVED** |
| **Service Role Key Security** | `createAdminClient()` protected by `'server-only'` import guard; zero client exposure. | **PRESERVED** |
| **Passwordless Auth Architecture** | Magic link OTP / owner session flow completely untouched. | **PRESERVED** |
| **Publish Validation Policy** | 9 Required fields strictly enforced; 6 optional fields never block. | **PRESERVED** |
| **Public Homepage** | Untouched, static `/` route preserved. | **PRESERVED** |

---

## 6. End-to-End Verification & Regression Test Results

### A. Publish & Draft Mutation E2E Suite (`scripts/test-publish-e2e.ts`)
```
=== PHASE 2B: PUBLISH FLOW END-TO-END DIAGNOSIS & REGRESSION TEST ===

✔ PASS [TEST 1]: Save Draft mutation executed cleanly.
✔ PASS [TEST 2]: Publish Validation correctly rejected missing Indonesian Description:
                 "Cannot publish: Missing required field(s): Indonesian Description."
✔ PASS [TEST 3]: Publish to Live with complete required fields + empty optional fields SUCCEEDED.
                 Database updated: publication_status = 'published', published_at assigned.
✔ PASS [TEST 4]: 4 Canonical initiatives intact (bros, roast-navigator, beauty-batch-os, skill-factory).

ALL PUBLISH DIAGNOSIS & REGRESSION TESTS PASSED!
```

### B. Refined Publish Policy Suite (`scripts/test-phase-2b-refinement.ts`)
```
=== PHASE 2B REFINEMENT: PUBLISH POLICY & VALIDATION TEST ===

✔ PASS [TEST 1]: Incomplete draft saved.
✔ PASS [TEST 2]: Missing English Tagline rejected with precise message.
✔ PASS [TEST 3]: Whitespace Indonesian Description rejected with precise message.
✔ PASS [TEST 4]: Complete required fields + EMPTY optional fields published.
✔ PASS [TEST 5]: Canonical initiatives verified intact.

ALL PHASE 2B REFINEMENT VALIDATION TESTS PASSED!
```

### C. Authorization Boundary Suite (`scripts/test-phase-2b-auth.ts`)
```
=== TESTING PHASE 2B SERVER ACTION AUTHORIZATION BOUNDARY ===

✔ [PASS] createInitiativeAction rejected unauthenticated call.
✔ [PASS] updateInitiativeDraftAction rejected unauthenticated call.
✔ [PASS] publishInitiativeAction rejected unauthenticated call.
✔ [PASS] archiveInitiativeAction rejected unauthenticated call.
✔ [PASS] deleteInitiativeAction rejected unauthenticated call.

ALL AUTHORIZATION BOUNDARY TESTS PASSED!
```

### D. TypeScript & Production Build
* `npx tsc --noEmit` $\rightarrow$ **0 errors (PASS)**
* `npm run build` $\rightarrow$ **7/7 routes compiled and statically optimized (PASS)**

---

## 7. Current State & Readiness

The local development server is running cleanly on **`http://localhost:7000`** (Task `task-267`).

* `/admin/initiatives` $\rightarrow$ Operational list registry.
* `/admin/initiatives/new` $\rightarrow$ Create initiative flow.
* `/admin/initiatives/[id]` $\rightarrow$ Bilingual editor with real-time field validation, permissive draft saves, strict required-field publishing, and isolated lifecycle/danger actions.

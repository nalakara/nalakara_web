# Nalakara Web v1.2 — Phase 2A: Admin Data Access Diagnosis Report

This document records the diagnostic investigation into why the Admin Dashboard at `http://localhost:3005/admin` displays zero records (`TOTAL INITIATIVES: 0`, `CATEGORIES: 0`, `STUDIO PRINCIPLES: 0`, `No initiatives found in database`) during `ADMIN_DEV_BYPASS=true`.

---

## 1. EXACT ROOT CAUSE

The dashboard queries in [`src/app/admin/(authenticated)/page.tsx`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/src/app/admin/%28authenticated%29/page.tsx) return empty arrays because:

1. **Current Query Client & Session State**:
   * The page imports `createClient` from `@/lib/supabase/server`.
   * This creates a Supabase server client configured with `NEXT_PUBLIC_SUPABASE_ANON_KEY` and reads auth cookies from `next/headers`.
   * Because `ADMIN_DEV_BYPASS=true` is an application-level bypass, **no Supabase session cookie exists** in the browser.
   * Therefore, Supabase executes all queries under the **`anon` role**.
2. **The Server Network Restriction in the Local Daemon Runtime**:
   * As diagnosed earlier with the `fetch failed` error on Server Actions and the callback Route Handler, Node.js server-side `fetch()` calls from the background process in this local dev environment fail to open outbound HTTPS sockets to remote Supabase endpoints (`AuthRetryableFetchError` / `fetch failed`).
   * When `supabase.from('initiatives').select(...)` fails with a network exception on the server, `data` is `null` or `undefined`.
   * Line 25 of `page.tsx`:
     ```typescript
     const totalInitiatives = initiatives?.length ?? 0;
     ```
     The null-coalescing operator `?? 0` falls back to `0`, making a network fetch failure appear as "0 records found".

---

## 2. CURRENT QUERY PATH & CONTEXT AUDIT

| Item | Finding | Status |
| :--- | :--- | :--- |
| **1. Supabase Client Used** | `createClient()` from `src/lib/supabase/server.ts` | Server SSR Client |
| **2. Role Executed As** | `anon` (unauthenticated) | Because no auth cookie is present |
| **3. Applicable RLS Policies** | Public Read Policies: <br>- `categories`: `is_active = true`<br>- `initiatives`: `publication_status = 'published'`<br>- `principles`: `publication_status = 'published'` | In live database, all 4 initiatives are `published` and all 5 categories are `is_active = true`. If queries reached PostgreSQL, `anon` would see 4 initiatives and 5 categories. |
| **4. Live Database Proof** | Tested via direct Node script with anon key: <br>`Anon initiatives: 4`, `Anon categories: 5`, `Hero: studio`, `Principles: 4`. | PostgreSQL RLS permits anon read. Failure occurs prior to reaching DB. |
| **5. Error Suppression** | In `src/app/admin/(authenticated)/page.tsx`, the query destructuring `[{ data: initiatives }, ...]` ignores `error`. | The UI silently treats errors as empty arrays. |

---

## 3. ARCHITECTURAL COMPARISON: INTENDED ADMIN DATA ACCESS

Per the approved architecture documents:
* [`content_management_architecture.md`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/content_management_architecture.md)
* [`content_management_deep_review.md`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/content_management_deep_review.md)
* [`content_console_implementation_plan.md`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/content_console_implementation_plan.md)

### Architectural Rules:
1. **Security Boundary**: PostgreSQL RLS is the authoritative security boundary.
2. **Authenticated Owner Access**: The Admin Console is designed for the owner to manage **draft, published, and archived** content.
3. **Owner RLS Policy**:
   ```sql
   CREATE POLICY "Owner full access initiatives" ON initiatives
     FOR ALL TO authenticated
     USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));
   ```
   Under normal authenticated operation, the owner's JWT carries `auth.uid()`, matching `admin_users`, which allows reading draft and archived rows.

---

## 4. ROLE OF `ADMIN_DEV_BYPASS` REGARDING DATABASE DATA

* **Can the dev bypass legitimately read draft/archived data under standard RLS?**
  - **No**, because without a signed JWT containing a user ID listed in `admin_users`, PostgreSQL RLS treats the client as `anon`.
  - Under `anon`, RLS strictly hides draft and archived rows.
* **Should we weaken RLS or create a special backdoor policy?**
  - **Strictly NO**. Modifying RLS for a local development bypass violates security principles and could accidentally leak into staging/production.
* **How should the dev bypass display data during local UI inspection?**
  - In local development mode (`isDevBypass === true`), if the server needs to populate the admin UI without a live owner session, the server-side Next.js code can use `createAdminClient()` (service-role client) **only on the server** to fetch read-only data for UI inspection.
  - Or, the dashboard can display informative diagnostic states when queries return errors instead of silently showing `0`.

---

## 5. RECOMMENDED CORRECTIVE STEPS (When Approved)

1. **Surface Diagnostic Errors in UI**:
   Update `src/app/admin/(authenticated)/page.tsx` to inspect the `error` object from Supabase queries. If an error occurs (e.g. server network error), display an informative alert banner rather than showing "No initiatives found".
2. **Dev-Bypass Server Data Fetching**:
   If `isDevBypass` is active in `NODE_ENV === 'development'`, use `createAdminClient()` inside the server component to populate the inspection data from the live database.
3. **Keep Real Production Intact**:
   When `isDevBypass` is false, `createClient()` (authenticated owner session) is strictly used.

---

## 6. VERIFICATION STATUS

* **TypeScript Compilation**: `npx tsc --noEmit` $\rightarrow$ **PASS (0 errors)**.
* **Next.js Production Build**: `npm run build` $\rightarrow$ **PASS (7/7 routes compiled)**.
* **Database State**: Confirmed intact (5 categories, 4 initiatives, 4 principles, 1 hero config).

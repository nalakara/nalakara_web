# Nalakara Web v1.2 — Phase 1: Migration Permission Diagnosis

This document records the exact diagnostic findings regarding the `permission denied for table categories (42501)` error encountered during the Phase 1 migration attempt.

---

## 1. Actual Migration Client Used

* **Client**: Official `@supabase/supabase-js` `createClient<Database>()` instantiated in `scripts/seed-supabase.ts`.
* **Configuration**: Initialized with `auth: { persistSession: false, autoRefreshToken: false }`.

---

## 2. Actual Credential Class Used

* **Variables Loaded**:
  * `NEXT_PUBLIC_SUPABASE_URL`: Defined and valid project URL.
  * `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Verified valid JWT with claim `role: 'anon'`.
  * `SUPABASE_SERVICE_ROLE_KEY`: Verified valid JWT with claim `role: 'service_role'`.
* **Credential Verification**:
  * Confirmed that `scripts/seed-supabase.ts` is **truly using the `service_role` key** (JWT payload decoded and confirmed `role: "service_role"`).
  * No secret keys were printed, exposed, or committed.

---

## 3. PostgreSQL Privilege Analysis vs. Supabase RLS

In PostgreSQL, accessing a table via PostgREST requires **TWO distinct security layers** to pass:

```
[ Incoming Request (PostgREST / Supabase REST API) ]
                      │
                      ▼
[ Layer 1: PostgreSQL Table GRANT Privileges ]
(Does the DB role 'service_role' / 'anon' have GRANT SELECT/INSERT on the table?)
                      │
         ┌────────────┴────────────┐
         │ YES                     │ NO
         ▼                         ▼
[ Layer 2: RLS Policies ]     [ 42501: permission denied for table ... ]
(Does RLS permit this row?)   (Query halts BEFORE checking RLS)
```

### Key Distinction:
1. **Layer 1 (PostgreSQL Object Grants)**:
   - When a table is created in the Supabase SQL Editor by a user/superuser without executing `GRANT ALL ON <table_name> TO service_role, anon, authenticated;`, PostgreSQL does not automatically grant table privileges to the API roles (`service_role`, `anon`, `authenticated`) unless default privileges are configured on that schema.
   - If PostgreSQL table grants are absent, PostgreSQL returns error code **`42501 (insufficient_privilege)`** immediately.
2. **Layer 2 (Row-Level Security / RLS)**:
   - The `service_role` role has PostgreSQL's `BYPASSRLS` attribute. It bypasses RLS policies (Layer 2).
   - **However**, `BYPASSRLS` only bypasses Layer 2. It **does NOT bypass Layer 1 (table-level object grants)**.

---

## 4. Root Cause of `permission denied for table categories`

* When [`supabase/schema.sql`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/supabase/schema.sql) was executed in the Supabase SQL Editor, it created the tables (`categories`, `initiatives`, `studio_principles`, `hero_config`, `admin_users`) and created RLS policies.
* **The schema did NOT include explicit table GRANT statements** for the PostgREST API roles (`service_role`, `authenticated`, `anon`).
* As a result, PostgREST requests connecting as PostgreSQL role `service_role` fail at Layer 1 with `42501 permission denied for table categories`.

---

## 5. Security Requirements & Non-Permissive Solution

We must **NOT** solve this by giving broad permissions to `anon` or `authenticated`.

### The Correct Minimal PostgreSQL Grants:
In standard Supabase architectures, PostgREST requires:
1. `service_role`: Full table privileges (`ALL`) on `public` tables (this is server-only and bypasses RLS safely for administrative tasks).
2. `authenticated` and `anon`: `SELECT` privileges on public tables (writes for `anon` remain completely blocked; writes for `authenticated` are governed strictly by the `admin_users` RLS policy).
3. `authenticated`: `ALL` (or `SELECT, INSERT, UPDATE, DELETE`) on public tables **only because RLS is enabled and will strictly block unauthorized users**.

### Exact SQL Required to Grant Layer 1 Privileges:
```sql
-- Grant table privileges to standard Supabase API roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Categories
GRANT SELECT ON categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO authenticated;
GRANT ALL ON categories TO service_role;

-- Initiatives
GRANT SELECT ON initiatives TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON initiatives TO authenticated;
GRANT ALL ON initiatives TO service_role;

-- Studio Principles
GRANT SELECT ON studio_principles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON studio_principles TO authenticated;
GRANT ALL ON studio_principles TO service_role;

-- Hero Config
GRANT SELECT ON hero_config TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON hero_config TO authenticated;
GRANT ALL ON hero_config TO service_role;

-- Admin Users
GRANT SELECT ON admin_users TO authenticated;
GRANT ALL ON admin_users TO service_role;
```

---

## 6. Should `seed.sql` Be Used?

* `supabase/seed.sql` runs directly inside the Supabase SQL Editor under the `postgres` / superuser role, completely bypassing PostgREST and API grant checks.
* **However**, running `seed.sql` alone will not resolve the underlying issue for future application Server Actions (`/admin`) connecting via `@supabase/ssr` or `service_role`.
* **Recommendation**:
  1. Add the minimal, standard `GRANT` statements to `supabase/schema.sql` (or run a small permission grant SQL in SQL Editor).
  2. Then run `scripts/seed-supabase.ts` via terminal to verify the full programmatic migration path and idempotency.

---

## 7. Security Implications

* `anon` receives only `SELECT` grants, and RLS ensures it can only view `status = 'published'` rows.
* `authenticated` receives table-level grants, but **RLS strictly blocks all operations unless the user's `auth.uid()` exists in `admin_users`**.
* `service_role` receives full access for server-side migration and administrative tasks.

---

## Final Verdict

> ### **FINAL VERDICT: MIGRATION CLIENT CORRECT — DATABASE PRIVILEGE ISSUE**
>
> The Node.js migration client and `.env.local` configuration are 100% correct and properly loaded the `service_role` JWT. The blocker is caused by missing PostgreSQL Layer 1 table `GRANT` statements for the `service_role`, `authenticated`, and `anon` roles on the newly created tables in the `public` schema.

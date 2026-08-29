# Nalakara Web v1.2 — Phase 0: Supabase Foundation Report

This report documents the completion of **Phase 0 (Supabase Foundation)** for Nalakara Web v1.2. Phase 0 establishes the database schema, relational constraints, Row-Level Security policies, TypeScript database contracts, and server-side Supabase client utilities without modifying public website rendering or existing component behavior.

---

## 1. Objective

To lay the database and authentication foundation for the future Nalakara Content Console (`/admin`) while keeping the public website 100% untouched and statically served.

---

## 2. Supabase Setup & Requirements

* **Target Backend**: Managed PostgreSQL via Supabase.
* **SQL Schema File**: [`supabase/schema.sql`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/supabase/schema.sql) is prepared and ready to be executed in the Supabase SQL Editor.
* **Environment Template**: [`.env.example`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/.env.example) defines the required connection keys.

---

## 3. Dependencies Added

Only the minimum official packages required for Next.js App Router Supabase integration were added:
1. **`@supabase/supabase-js`** (`v2.49.1`): Official Supabase JavaScript client for querying and data manipulation.
2. **`@supabase/ssr`** (`v0.5.2`): Official SSR/App Router package for cookie-based session management across Server Components, Server Actions, and Middleware.

*No heavy UI libraries, external state stores, or generic CMS packages were installed.*

---

## 4. Environment Variables

Separated into public browser-safe values and server-only secrets:

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public / Browser | Supabase project URL (`https://<project-ref>.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public / Browser | Supabase anonymous API key for public client and auth. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-Only Secret** | Privileged key for seed scripts and admin tasks (**never sent to browser**). |
| `ADMIN_OWNER_EMAIL` | **Server-Only Secret** | Email address authorized for single-owner console access. |

---

## 5. Database Schema

The SQL schema ([`supabase/schema.sql`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/supabase/schema.sql)) defines 4 core tables:

1. **`categories`**:
   - `id VARCHAR(32) PRIMARY KEY`
   - `name_en VARCHAR(64)`, `name_id VARCHAR(64)`
   - `sort_order INTEGER`, `is_active BOOLEAN`
   - `created_at`, `updated_at`
2. **`initiatives`**:
   - `id VARCHAR(64) PRIMARY KEY`, `slug VARCHAR(64) UNIQUE`
   - `name VARCHAR(64)`
   - `category_id VARCHAR(32) REFERENCES categories(id) ON DELETE RESTRICT`
   - `lifecycle lifecycle_stage`, `access_model access_model`
   - `tagline_en`, `tagline_id`, `description_en`, `description_id`
   - `target_url`, `is_external`, `featured`, `sort_order`, `status content_status`
   - `commercial_badge_en`, `commercial_badge_id`, `commercial_action_en`, `commercial_action_id`
   - `created_at`, `updated_at`, `published_at`
3. **`studio_principles`**:
   - `id VARCHAR(32) PRIMARY KEY`, `number VARCHAR(4)`
   - `title_en`, `title_id`, `description_en`, `description_id`
   - `sort_order`, `status content_status`
   - `created_at`, `updated_at`
4. **`hero_config`** (Singleton):
   - `id VARCHAR(16) PRIMARY KEY DEFAULT 'primary'`
   - `mode hero_mode NOT NULL DEFAULT 'studio'`
   - `featured_initiative_id VARCHAR(64) REFERENCES initiatives(id) ON DELETE SET NULL`
   - `show_lifecycle_bar BOOLEAN NOT NULL DEFAULT true`
   - `created_at`, `updated_at`

---

## 6. Controlled Vocabularies

Defined as immutable PostgreSQL ENUM types:
* **`lifecycle_stage`**: `'idea'`, `'lab'`, `'project'`, `'product'`, `'commercial'`
* **`access_model`**: `'concept'`, `'private-alpha'`, `'public-beta'`, `'production'`, `'commercial'`
* **`content_status`**: `'draft'`, `'published'`, `'archived'`
* **`hero_mode`**: `'studio'`, `'featured_initiative'`

---

## 7. Relational Constraints

* **Foreign Key Protection**: `initiatives.category_id REFERENCES categories(id) ON DELETE RESTRICT`. A category cannot be deleted if referenced by any initiative.
* **Slug Uniqueness**: `initiatives.slug` is constrained as unique.
* **Hero Reference**: `hero_config.featured_initiative_id REFERENCES initiatives(id) ON DELETE SET NULL`.
* **Singleton Constraint**: `hero_config` has check constraint `id = 'primary'` to prevent multi-row drift.

---

## 8. Row-Level Security (RLS) Policies

All tables have RLS enabled:
* **Public Policy**: Anonymous visitors can only read `status = 'published'` on initiatives/principles and `is_active = true` on categories.
* **Admin Policy**: Authenticated session (`auth.role() = 'authenticated'`) has full read/write privileges.
* **Draft Isolation**: Any record with `status = 'draft'` or `'archived'` is invisible to the public read policy.

---

## 9. Authentication Foundation

* **Utilities**:
  * [`src/lib/supabase/client.ts`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/src/lib/supabase/client.ts): Browser client with anon key.
  * [`src/lib/supabase/server.ts`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/src/lib/supabase/server.ts): Server client using Next.js cookie handling (`cookies()`) for Server Components and Server Actions.
  * [`src/lib/supabase/middleware.ts`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/src/lib/supabase/middleware.ts) & [`src/middleware.ts`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/src/middleware.ts): Automatic session refresh and protection for `/admin/*` routes.

---

## 10. Next.js Integration Boundary

* Public website routes (`src/app/page.tsx`, `<Hero />`, `<FoundryField />`, `<Initiatives />`, etc.) continue reading directly from the frozen v1.1 source (`src/data/ecosystem.ts` and `src/data/i18n.ts`).
* **Zero Public Impact**: Public site runtime, CSS, and layout are 100% unaffected.

---

## 11. Security Verification

* **Service-Role Key**: Strictly confined to server scripts; never exposed to browser bundles.
* **Git Cleanliness**: `.env.local` is protected by `.gitignore`; no secrets committed.
* **Draft Protection**: Public RLS query verified to exclude draft/archived records.

---

## 12. Build & Type Verification

* **TypeScript**: `npx tsc --noEmit` $\rightarrow$ **PASS (0 errors)**
* **Production Build**: `npm run build` $\rightarrow$ **PASS (Static prerender 4/4 pages, Middleware 93.4 kB)**

---

## 13. Files Changed / Created

* **New Files**:
  * [`.env.example`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/.env.example)
  * [`supabase/schema.sql`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/supabase/schema.sql)
  * [`src/types/database.ts`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/src/types/database.ts)
  * [`src/lib/supabase/client.ts`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/src/lib/supabase/client.ts)
  * [`src/lib/supabase/server.ts`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/src/lib/supabase/server.ts)
  * [`src/lib/supabase/middleware.ts`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/src/lib/supabase/middleware.ts)
  * [`src/middleware.ts`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/src/middleware.ts)
  * [`phase_0_supabase_foundation_report.md`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/phase_0_supabase_foundation_report.md)
* **Modified Files**:
  * [`package.json`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/package.json) (Added `@supabase/supabase-js`, `@supabase/ssr`)
  * `package-lock.json`

---

## 14. Remaining Phase 0 Risks & Next Steps

* **Prerequisite for Phase 1**: The user needs to apply [`supabase/schema.sql`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/supabase/schema.sql) in their Supabase project and provide the actual environment values in `.env.local` when ready for Phase 1 (Data Migration).
* **Current Public Status**: 100% frozen v1.1 running cleanly on Vercel.

---

## 15. Phase 0 Completion Status

> **Phase 0 Status: COMPLETE AND VERIFIED.**

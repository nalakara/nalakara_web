# Nalakara Web v1.2 — Content Console Implementation Plan

This document establishes the comprehensive, phased implementation plan for introducing the **Nalakara Content Console (v1.2)**. It provides a lightweight, secure administrative interface for the studio owner to manage routine content independently of Antigravity or source-code modifications while strictly preserving Nalakara's editorial discipline, bilingual integrity, and sub-second static public performance.

---

## 1. Objective

To implement a single-owner administrative console (`/admin`) powered by Supabase PostgreSQL and Next.js App Router Server Actions that allows managing:
* **Initiatives**: lifecycle stage, access model, categories, bilingual taglines/descriptions, ordering, URLs, and featured flags.
* **Categories**: taxonomy definitions, bilingual names, and display ordering.
* **Hero**: presentation mode (`studio` manifesto vs. `featured_initiative` reference).
* **Studio Principles**: foundational axioms, ordering, and bilingual copy.
* **Publishing Workflow**: Draft isolation, real-time authenticated preview (`/admin/preview`), and on-demand cache revalidation (`revalidateTag()`).

---

## 2. Baseline Architecture (v1.1)

* **Next.js Version**: 15.5.24 (App Router) on React 19.
* **Rendering Baseline**: 100% Static Site Generation with First Load JS: 113 kB.
* **Bilingual Layer**: Client-side `LanguageContext` syncing `<html lang>` and `localStorage`.
* **Canonical Data Baseline**: `src/data/ecosystem.ts` and `src/data/i18n.ts`.

---

## 3. System Architecture & Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│                 CONTENT CONSOLE (/admin)                    │
│    - Authenticated via Supabase Auth (Magic Link / OTP)     │
│    - Restrained editorial UI (Vanilla CSS Modules)          │
│    - Next.js Server Actions with strict Zod validation      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               SUPABASE POSTGRESQL DATABASE                  │
│    - Tables: initiatives, categories, studio_principles,    │
│              hero_config, site_settings                     │
│    - Row-Level Security (RLS) enforcing single-owner write  │
│    - Status: 'draft' | 'published' | 'archived'             │
└──────────────────────────────┬──────────────────────────────┘
                               │
            Publish Action: revalidateTag('ecosystem')
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                PUBLIC SITE (nalakara.com)                   │
│    - Next.js Server Components with cached ISR fetchers     │
│    - Zero direct database queries from visitor browsers     │
│    - 100% static edge serving on Vercel Edge Network        │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Phase 0 — Supabase Foundation

* **Objective**: Provision the database, establish connection utilities, define database schema, configure RLS, and configure authentication foundation.
* **Files / Components Affected**:
  * `src/lib/supabase/client.ts` (Browser client with anon key for auth)
  * `src/lib/supabase/server.ts` (Server client for Server Components & Actions)
  * `src/lib/supabase/middleware.ts` (Session refresh & route protection)
  * `src/middleware.ts` (Route interception for `/admin/*`)
  * `.env.local` / `.env.example` (Configuring connection keys)
* **Infrastructure**: 1 Supabase Project (PostgreSQL + Auth).
* **Dependencies**: `@supabase/supabase-js`, `@supabase/ssr`.
* **Validation**:
  * Database tables and ENUMs successfully created via SQL migration.
  * RLS policies active and verified against unauthorized queries.
  * Server connection successfully executes test query.
* **Stop Condition**: Pause for human verification of database connectivity before data seeding.

---

## 5. Phase 1 — Data Migration & Verification

* **Objective**: Deterministically seed all current frozen v1.1 data into Supabase without altering public-facing code.
* **Files / Components Affected**:
  * `scripts/seed-supabase.ts` (One-time migration script reading `src/data/ecosystem.ts` and `src/data/i18n.ts`)
  * `scripts/verify-migration.ts` (Assertion test comparing static constants with database records)
* **Data Transferred**:
  * 4 Categories (`software`, `digital-system`, `physical-good`, `experimental`)
  * 4 Initiatives (`bros`, `roast-navigator`, `beauty-batch-os`, `skill-factory`) with exact `private-alpha` and `project` statuses
  * 4 Principles (`Domain Independence`, `Utility Over Novelty`, `Autonomous Product Identity`, `Disciplined Lifecycle Evolution`)
  * 1 Singleton `hero_config` (`mode = 'studio'`)
* **Validation**: Automated assertion report outputting 100% property-by-property parity.
* **Stop Condition**: Verify data parity report before building admin UI.

---

## 6. Phase 2 — Admin Content Console UI

* **Objective**: Build the owner-facing administration dashboard adhering strictly to Nalakara's restrained aesthetic.
* **Files / Components Affected**:
  * `src/app/admin/layout.tsx` (Monospace editorial navigation shell)
  * `src/app/admin/login/page.tsx` (Passwordless / Magic Link login screen)
  * `src/app/admin/initiatives/page.tsx` & `[id]/page.tsx` (Initiative editing forms)
  * `src/app/admin/categories/page.tsx` (Category manager)
  * `src/app/admin/philosophy/page.tsx` (Principles editor)
  * `src/app/admin/hero/page.tsx` (Hero mode selector)
  * `src/app/admin/admin.module.css` (Restrained dark UI tokens)
* **UX Principles**:
  * Zero vanity graphs or generic metrics.
  * Side-by-side bilingual editing panes (EN left, ID right).
  * System-controlled dropdowns for Lifecycle and Access Models.
* **Validation**: Owner can log in, edit an initiative, and save changes to draft state.
* **Stop Condition**: Test all CRUD operations in draft mode.

---

## 7. Phase 3 — Draft & Preview Mechanism

* **Objective**: Provide an authenticated, real-time live preview route that displays draft data within the exact public page components.
* **Files / Components Affected**:
  * `src/app/admin/preview/page.tsx` (Server Component fetching draft data)
  * `src/components/admin/PreviewToolbar.tsx` (Floating top bar with EN/ID toggle and Publish button)
* **Security & Isolation**:
  * `/admin/preview` is strictly behind Next.js auth middleware.
  * Public requests to `/` continue to see only `status = 'published'`.
* **Validation**: Verify that modifying an initiative's draft tagline shows up in `/admin/preview` immediately but leaves `nalakara.com` unchanged.
* **Stop Condition**: Confirm zero leakage of draft data to public visitors.

---

## 8. Phase 4 — Publishing & On-Demand Revalidation

* **Objective**: Implement the publication workflow that validates completeness and triggers instant cache invalidation.
* **Files / Components Affected**:
  * `src/lib/actions/publish.ts` (Server Action executing validation and cache purge)
  * `src/lib/cms/queries.ts` (Cached data fetchers utilizing `unstable_cache` with tag `['ecosystem-public']`)
* **Workflow**:
  1. Admin clicks **"Publish All Changes"**.
  2. Server Action verifies all bilingual required fields.
  3. Updates database records (`status = 'published'`, `published_at = NOW()`).
  4. Calls `revalidateTag('ecosystem-public')` and `revalidatePath('/')`.
  5. UI displays success confirmation toast.
* **Validation**: Verify that clicking publish updates the edge cache and displays fresh content within <1 second.
* **Stop Condition**: Audit cache revalidation behavior.

---

## 9. Phase 5 — Public Source Migration & Cutover

* **Objective**: Switch the public website data-fetching layer from hardcoded TypeScript files to the cached Supabase data layer.
* **Files / Components Affected**:
  * `src/app/page.tsx` (Fetches `getPublishedEcosystemData()`)
  * `src/lib/data-source.ts` (Abstraction layer with hardcoded fallback if database connection drops)
* **Safety Mechanism**: If Supabase connection fails during build or runtime, the data fetcher automatically falls back to `src/data/ecosystem.ts` without crashing.
* **Validation**: Run `npx tsc --noEmit` and `npm run build`; confirm 100% static prerender.
* **Stop Condition**: Human review of live preview before deployment.

---

## 10. Phase 6 — Production Verification & Freeze

* **Objective**: Full end-to-end audit on staging/production deployment.
* **Verification Scope**:
  * Public site load time and static caching.
  * English & Indonesian language toggling.
  * Interactive canvas animations in `FoundryField`.
  * Admin login and session termination.
  * Editing an initiative $\rightarrow$ Preview $\rightarrow$ Publish $\rightarrow$ Live confirmation.
  * Rollback test (unpublishing an initiative).
* **Stop Condition**: Create `content_console_walkthrough.md` and await final user freeze approval.

---

## 11. Database Schema Specification

```sql
-- 1. Custom Controlled Enumerations
CREATE TYPE lifecycle_stage AS ENUM ('idea', 'lab', 'project', 'product', 'commercial');
CREATE TYPE access_model AS ENUM ('concept', 'private-alpha', 'public-beta', 'production', 'commercial');
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE hero_mode AS ENUM ('studio', 'featured_initiative');

-- 2. Categories Table
CREATE TABLE categories (
  id VARCHAR(32) PRIMARY KEY, -- e.g. 'software', 'digital-system'
  name_en VARCHAR(64) NOT NULL,
  name_id VARCHAR(64) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Initiatives Table
CREATE TABLE initiatives (
  id VARCHAR(64) PRIMARY KEY, -- e.g. 'bros', 'roast-navigator'
  slug VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(64) NOT NULL,
  category_id VARCHAR(32) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  lifecycle lifecycle_stage NOT NULL DEFAULT 'idea',
  access_model access_model NOT NULL DEFAULT 'concept',
  tagline_en VARCHAR(140) NOT NULL,
  tagline_id VARCHAR(140) NOT NULL,
  description_en VARCHAR(320) NOT NULL,
  description_id VARCHAR(320) NOT NULL,
  target_url VARCHAR(255),
  is_external BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status content_status NOT NULL DEFAULT 'draft',
  commercial_badge_en VARCHAR(40),
  commercial_badge_id VARCHAR(40),
  commercial_action_en VARCHAR(40),
  commercial_action_id VARCHAR(40),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);
CREATE INDEX idx_initiatives_status_order ON initiatives(status, sort_order);

-- 4. Studio Principles Table
CREATE TABLE studio_principles (
  id VARCHAR(32) PRIMARY KEY,
  number VARCHAR(4) NOT NULL, -- e.g. '01', '02', '03', '04'
  title_en VARCHAR(80) NOT NULL,
  title_id VARCHAR(80) NOT NULL,
  description_en TEXT NOT NULL,
  description_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status content_status NOT NULL DEFAULT 'published',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Hero Singleton Configuration
CREATE TABLE hero_config (
  id VARCHAR(16) PRIMARY KEY DEFAULT 'primary',
  mode hero_mode NOT NULL DEFAULT 'studio',
  featured_initiative_id VARCHAR(64) REFERENCES initiatives(id) ON DELETE SET NULL,
  show_lifecycle_bar BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 12. Security & Row-Level Security (RLS) Model

* **Rule 1: Anon / Public Access**:
  * Direct table reads from the browser are disabled or restricted to `status = 'published'` on `categories`, `initiatives`, `studio_principles`, and `hero_config`.
* **Rule 2: Authenticated Admin Access**:
  * Full `ALL` permissions (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) granted exclusively when `auth.role() = 'authenticated'`.
* **Rule 3: Service Role**:
  * Used only by build scripts and database seeders. The `SUPABASE_SERVICE_ROLE_KEY` is strictly server-side and never exposed via `NEXT_PUBLIC_*`.

```sql
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_principles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_config ENABLE ROW LEVEL SECURITY;

-- Public Read Policy
CREATE POLICY "Allow public read published initiatives" ON initiatives
  FOR SELECT USING (status = 'published');

-- Admin Full Access Policy
CREATE POLICY "Allow admin full access on initiatives" ON initiatives
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

---

## 13. Bilingual Validation Rules

* **Atomic Records**: English and Indonesian data reside in the same database row to ensure transactional integrity.
* **Publish Quality Gate**:
  * Setting an initiative to `published` requires non-empty strings for: `name`, `tagline_en`, `tagline_id`, `description_en`, and `description_id`.
  * Incomplete draft records can be saved as `status = 'draft'` without validation errors.
* **No Language Bleed**: If Indonesian is selected, only `*_id` strings are fetched and rendered.

---

## 14. Hero Model Constraints

* In v1.2, the admin controls the **presentation mode**:
  * `studio`: Standard canonical brand manifesto.
  * `featured_initiative`: Selects an existing initiative (e.g. `B.R.O.S.`) to highlight in the hero section without duplicating tagline or link data.
* Custom arbitrary headline editing is disabled in v1.2 to preserve approved core brand copy.

---

## 15. Rollback Strategy

* **Editorial Rollback**: If an accidental edit is published, the owner sets `status = 'draft'` or updates the text and clicks **"Publish"**, triggering immediate cache invalidation.
* **Codebase Fallback**: `src/data/ecosystem.ts` and `src/data/i18n.ts` remain committed in the repository as immutable fallback seeds. If the database connection is removed, the site automatically falls back to local files without crashing.

---

## 16. Comprehensive Testing Plan

| Scope | Test Description | Success Criteria |
| :--- | :--- | :--- |
| **Data Integrity** | Foreign key restriction on category deletion | Database prevents deleting a category with assigned initiatives. |
| **Bilingual Gate** | Attempt to publish with empty `description_id` | Server Action rejects with `"Indonesian description required"`. |
| **Draft Isolation** | Query public `/` while an item is in `draft` | Draft item is 100% invisible on public site. |
| **Preview Access** | Unauthenticated visit to `/admin/preview` | Clean redirect to `/admin/login`. |
| **Publish Invalidation** | Update live initiative tagline and publish | Public `/` reflects update upon next reload. |
| **Performance** | Lighthouse / CWV audit on public route | Performance score $\ge 98$, zero database queries at runtime. |

---

## 17. Operational Workflow for Site Owner

1. **Access**: Navigate to `nalakara.com/admin` $\rightarrow$ log in via secure Magic Link or OTP.
2. **Edit**: Open an initiative $\rightarrow$ update English & Indonesian taglines $\rightarrow$ click **"Save Draft"**.
3. **Inspect**: Click **"Preview Drafts ↗"** $\rightarrow$ review live changes across both `EN` and `ID` tabs on `/admin/preview`.
4. **Deploy**: Click **"Publish to Live"** on the preview toolbar $\rightarrow$ updates propagate immediately to public visitors.

---

## 18. Risks & Mitigations

* **Risk**: Vercel cache retains stale data after publish.
  * *Mitigation*: Server action combines `revalidateTag('ecosystem-public')` and `revalidatePath('/')`.
* **Risk**: Supabase free-tier project pauses after inactivity.
  * *Mitigation*: Next.js static edge cache ensures the public site never goes down. A scheduled GitHub Action / Vercel Cron sends a weekly heartbeat ping.

---

## 19. Definition of Done (DoD)

* [ ] Supabase database provisioned with strict schema, ENUMs, foreign keys, and RLS.
* [ ] Current v1.1 data seeded and verified with 100% property match.
* [ ] Single-owner passwordless authentication implemented and securing `/admin/*`.
* [ ] Editorial admin interface built with Vanilla CSS Modules.
* [ ] Real-time `/admin/preview` route rendering draft data using public components.
* [ ] Publishing server action executing validation and cache revalidation.
* [ ] Public site seamlessly consuming cached database records with local file fallback.
* [ ] Zero performance, visual, or layout regressions.
* [ ] All tests passing (`tsc --noEmit`, `npm run build`).

---

## 20. Final Recommendation

> **Proceed with implementation following the 7 staged phases. Maintain strict phase gates and verify data parity before switching public rendering.**

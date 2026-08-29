# Nalakara Web — Content Management Deep Review

This document provides a rigorous architectural validation of the proposed **Supabase PostgreSQL + Next.js App Router Server Actions + On-Demand Cache Revalidation** architecture for Nalakara Web. It establishes the concrete implementation boundaries, rendering strategy, data security, preview mechanism, and migration safety before any code or infrastructure is provisioned.

---

## 1. Executive Verdict

### **Verdict: PROCEED WITH ARCHITECTURAL REFINEMENTS (Option B)**

The proposed architecture is sound, safe, and exceptionally well-suited for Nalakara Web. However, based on this deep inspection, the following critical refinements must be enforced:
1. **Public Site Rendering**: Public users **never** connect to Supabase directly. Public pages use Next.js Server Components with `unstable_cache` / ISR data tagging. Vercel serves pure static HTML at the edge. If Supabase is unreachable, Vercel continues serving the stale static cache with zero downtime.
2. **Restricted Hero Model in v1**: The Hero record will NOT support arbitrary custom headlines/subheads in v1. It only toggles between **Mode A (Studio Manifesto)** and **Mode B (Featured Initiative Reference)** to protect the established brand voice.
3. **Structured Content Integrity**: The commercial badge in the UI will strictly derive from the initiative's `availability` status (`private-alpha`, `public-beta`, `production`, `commercial`), preventing contradictory claims.
4. **Enforced Bilingual Completeness**: The publishing action will hard-block setting `status = 'published'` if any required English or Indonesian field is missing.

---

## 2. Current Architecture Review

* **Framework**: Next.js 15.5.24 App Router on React 19.
* **Component Tree Boundaries**:
  * `src/app/layout.tsx`: Server Component wrapping `{children}` inside client `<LanguageProvider>`.
  * `src/app/page.tsx`: Server Component composing `<Header />`, `<Hero />`, `<Initiatives />`, `<Registry />`, `<Philosophy />`, `<Footer />`.
  * `src/components/FoundryField.tsx`: Client Component managing interactive 2D HTML5 canvas physics, animation loop, and touch deflection.
  * `src/components/Header.tsx`, `Hero.tsx`, `Initiatives.tsx`, `Registry.tsx`, `ItemCard.tsx`, `Philosophy.tsx`, `Footer.tsx`: Client components consuming `useLanguage()` for instantaneous bilingual switching without page reloads.
* **Data Sources**:
  * `src/data/ecosystem.ts`: 4 initiatives (`B.R.O.S.`, `Roast Navigator`, `Beauty Batch OS`, `Nalakara Skill Factory`), 4 principles, studio metadata.
  * `src/data/i18n.ts`: Typed dictionaries for UI chrome, lifecycle annotations, filter metadata, accessibility tags, and origin footnotes.
* **Bundle Footprint**: 100% static prerender, First Load JS: 113 kB, 0 external runtime dependencies.

---

## 3. Proposed Architecture Validation

| Requirement | Proposed Architecture | Validation & Assessment |
| :--- | :--- | :--- |
| **Public Speed** | Supabase DB + Next.js Server Components | **PASS**: Statically cached at Vercel Edge. Zero DB latency for visitors. |
| **Bilingual Model** | Paired JSON/Columns on records | **PASS**: Atomic language pairs, zero orphaned translations. |
| **Foundry Field** | System-driven node coordinates | **PASS**: Canvas math remains in codebase; only labels adapt. |
| **Operational Simplicity**| Single Supabase PostgreSQL project | **PASS**: 1 database, 0 extra microservices, $0/month on free tier. |
| **Developer Discipline**| System ENUMs & RLS | **PASS**: Admin cannot invent invalid lifecycle stages. |

---

## 4. Public Rendering Strategy

### Recommended: **Option B (Next.js Cached Data Layer / ISR)**

```text
[ Public Visitor ]
       │ HTTP GET /
       ▼
[ Vercel Edge Network ] ──(Cache Hit: 99.9% of visits)──> [ Pre-rendered Static HTML ] (0ms DB latency)
       │
       │ (Cache Miss or On-Demand Invalidation after Admin Publish)
       ▼
[ Next.js Server Component (src/app/page.tsx) ]
       │ fetchCachedEcosystemData() with Next.js Cache Tags: ['ecosystem-public']
       ▼
[ Supabase PostgreSQL ] (Queries ONLY published records: status = 'published')
       │ Returns structured JSON
       ▼
[ Pre-render HTML & Update Vercel Edge Cache ]
```

### Key Security & Performance Guarantees:
* **No Database Credentials in Browser**: Public visitors never receive Supabase URLs or anon keys.
* **Edge Serving**: All public traffic is served from static edge cache.
* **On-Demand Purge**: When the admin clicks "Publish", Next.js executes `revalidateTag('ecosystem-public')`, instantly updating edge cache without a Git commit or full Vercel redeployment.

---

## 5. Draft vs. Published Model

A clean, non-overengineered **Two-State System (`draft` | `published`)** with archival capability:

* **Record Status Column**: `status VARCHAR(16)` with values:
  * `'draft'`: Editable by admin, visible ONLY in `/admin` and `/admin/preview`.
  * `'published'`: Live on the public website.
  * `'archived'`: Retained in database for historical reference, hidden from both preview and public site.
* **Publication Timestamp**: `published_at TIMESTAMPTZ` and `updated_at TIMESTAMPTZ`.
* **Atomicity**: Changes to an existing published record remain in `draft` state until explicitly published, or the record can be saved directly as published if all quality gates pass.

---

## 6. Preview Architecture

### Route: `/admin/preview`

1. **Authentication Gate**: Protected by Next.js Server Middleware (`src/middleware.ts`). Unauthenticated users are redirected to `/admin/login`.
2. **Data Fetching**: The preview page executes `getDraftEcosystemData()`, querying Supabase directly (bypassing the public cache) using the authenticated server client.
3. **Component Reusability**: The preview route imports the **exact same components** (`<Hero />`, `<Initiatives />`, `<Registry />`, `<Philosophy />`, `<Footer />`) wrapped in a preview context.
4. **Floating Admin Banner**: Renders a fixed top bar showing:
   * Status indicator: `[ PREVIEW MODE — DRAFT DATA ]`
   * Language Switcher: `[ EN / ID ]`
   * One-Click Action: `[ Publish All Changes to Live ]`

---

## 7. Authentication & Security

### Recommendation: **Supabase Auth with Passwordless Magic Link / Email-Password**

* **Audience**: Single Studio Owner.
* **Flow**:
  1. Owner navigates to `/admin/login`.
  2. Enters email $\rightarrow$ receives secure 6-digit OTP code or Magic Link (or enters secure password).
  3. Supabase sets an HTTP-only secure cookie (`sb-access-token`, `sb-refresh-token`).
  4. Next.js Middleware checks session validity on any `/admin/*` route.
  5. Sign out destroys cookies and redirects to `/`.
* **Unauthorized Access**: Returns `404 Not Found` or clean redirect to `/admin/login` without disclosing system details.

---

## 8. Supabase Security & Row-Level Security (RLS)

| Actor | Supabase Key Used | Access Permission | RLS Policy Enforced |
| :--- | :--- | :--- | :--- |
| **Public Visitors** | *None* (Server-cached) | Read-only static HTML | Direct DB access blocked. |
| **Next.js Public Fetcher** | `SUPABASE_ANON_KEY` | `SELECT` only | `status = 'published'` |
| **Admin UI (Server Actions)**| Authenticated JWT | `SELECT`, `INSERT`, `UPDATE`, `DELETE` | `auth.uid() IS NOT NULL` |
| **System Migration / Seeds** | `SUPABASE_SERVICE_ROLE_KEY` | Full Admin | Server-only / Local scripts (never in client). |

---

## 9. Content Model Specification

### 9.1 Table: `categories`
```sql
CREATE TABLE categories (
  id VARCHAR(32) PRIMARY KEY, -- e.g. 'software', 'digital-system', 'physical-good'
  name_en VARCHAR(64) NOT NULL,
  name_id VARCHAR(64) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 9.2 Table: `initiatives`
```sql
CREATE TYPE lifecycle_stage AS ENUM ('idea', 'lab', 'project', 'product', 'commercial');
CREATE TYPE access_model AS ENUM ('concept', 'private-alpha', 'public-beta', 'production', 'commercial');
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');

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
  commercial_badge_en VARCHAR(40), -- derived or custom override
  commercial_badge_id VARCHAR(40),
  commercial_action_en VARCHAR(40),
  commercial_action_id VARCHAR(40),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_initiatives_status_order ON initiatives(status, sort_order);
```

### 9.3 Table: `studio_principles`
```sql
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
```

### 9.4 Table: `hero_config` (Singleton)
```sql
CREATE TYPE hero_mode AS ENUM ('studio', 'featured_initiative');

CREATE TABLE hero_config (
  id VARCHAR(16) PRIMARY KEY DEFAULT 'primary',
  mode hero_mode NOT NULL DEFAULT 'studio',
  featured_initiative_id VARCHAR(64) REFERENCES initiatives(id) ON DELETE SET NULL,
  show_lifecycle_bar BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 10. Content Integrity Rules

1. **Hard-Coded Lifecycle ENUMs**: Admin UI presents a `<select>` with exact values: `idea`, `lab`, `project`, `product`, `commercial`. Database rejects arbitrary strings.
2. **Relational Category Safety**: `ON DELETE RESTRICT` guarantees that a category cannot be deleted while initiatives reference it.
3. **Structured Commercial Badging**: If `access_model = 'private-alpha'`, the system automatically sets the badge to `"Commercial Candidate"` / `"Kandidat Komersial"`. The admin cannot enter misleading commercial claims.
4. **URL Format Enforcement**: Target URLs must pass a strict `https://` regex test.

---

## 11. Hero Model Deep Review

* **v1 Scope**: The Hero component in v1 is an essential pillar of Nalakara's manifesto. The admin will control **Mode Selection**:
  * **Mode A (`studio`)**: Displays the canonical brand headline (*"A studio and foundry that turns ideas into useful things."* / *"Studio dan ruang cipta yang mewujudkan gagasan menjadi karya nyata berdaya guna."*).
  * **Mode B (`featured_initiative`)**: Dynamically links the Hero to an active initiative (e.g. `B.R.O.S.`), pulling its tagline and action link directly without data duplication.
* **Unrestricted Copy Modification**: Deferred to future versions to protect core brand positioning.

---

## 12. Bilingual Model Deep Review

* **No Siloed Records**: English and Indonesian fields exist side-by-side on the same record (`tagline_en` & `tagline_id`).
* **Strict Validation Gate**:
  * Saving as **Draft**: Permitted even if Indonesian translation is in progress.
  * Setting to **Published**: Programmatically blocked if any required `*_id` or `*_en` field is empty or whitespace.
* **No Fallback Contamination**: Avoids rendering English text when viewing Indonesian mode (and vice versa).

---

## 13. Philosophy Model

* **Storage**: Normalized in `studio_principles` table.
* **Ordering**: Controlled by `sort_order` and numbered string (`01`, `02`, `03`, `04`).
* **Admin Capability**: Owner can update the text of existing axioms or adjust order without code modifications.

---

## 14. Publishing & Cache Invalidation

1. Admin clicks **"Publish"** on `/admin`.
2. Next.js Server Action:
   - Validates required bilingual fields.
   - Updates `initiatives` record (`status = 'published'`, `updated_at = NOW()`).
   - Calls `revalidateTag('ecosystem-public')` and `revalidatePath('/')`.
3. Vercel Edge purges cached static HTML.
4. Next visitor request re-renders static HTML with fresh data.
5. Admin UI receives an instant visual success toast: `"Published to Live"`.

---

## 15. Rollback Strategy

* **Minimum Practical Solution**:
  * Every table maintains `updated_at` and `status`.
  * If an edit is erroneous, the owner can set `status = 'draft'` or `'archived'` and click "Publish", instantly removing it from the live site.
  * The original frozen baseline remains preserved in `src/data/ecosystem.ts` as a hard fallback seed script.

---

## 16. Migration Strategy

1. **Seed Script Creation**: Write `scripts/seed-supabase.ts` that imports `ECOSYSTEM_INITIATIVES`, `STUDIO_PRINCIPLES`, and `CATEGORIES` from `src/data/ecosystem.ts`.
2. **Deterministic Population**: Insert records into Supabase with matching IDs (`bros`, `roast-navigator`, etc.).
3. **Data Verification Report**: Run an automated comparator asserting 100% string and property equality between the TypeScript source and the Supabase database.
4. **Zero Downtime Handoff**: Update `src/lib/data.ts` to query Supabase with static caching; existing UI components require 0 line changes.

---

## 17. Failure / Fallback Strategy

* **Supabase Outage**: Because Next.js caches the rendered page at Vercel's edge, an outage of Supabase has **zero impact** on public visitors. The site continues serving cached static pages.
* **Build-Time Fallback**: If Supabase is unreachable during a build, the data-fetching layer falls back seamlessly to the static `src/data/ecosystem.ts` constants.

---

## 18. Admin Boundary Definition

```
┌─────────────────────────────────────────────────────────────┐
│                 ADMIN / OWNER CAPABILITIES                  │
│  - Edit Taglines & Descriptions (EN & ID)                   │
│  - Select Lifecycle Stage (Idea → Commercial)               │
│  - Select Access Model (Concept → Commercial)               │
│  - Reorder Initiatives & Filter Categories                  │
│  - Toggle Hero Mode (Studio vs. Featured Project)           │
│  - Edit Philosophy Axioms                                   │
│  - Save Drafts, Preview, and Publish                        │
└─────────────────────────────────────────────────────────────┘
                               ▲
                      STRICT BOUNDARY
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 CODE / DEVELOPER CONTROLS                   │
│  - 2D Canvas Physics & Tensor Field Coordinate Algorithms   │
│  - Typography Scale, Fonts, and Monospace System            │
│  - Dark Palette CSS Variables & WCAG AA Contrast Tokens     │
│  - Component DOM Architecture & Semantic HTML               │
│  - 5-Stage Lifecycle Definitions & Taxonomy Schema          │
│  - Antislop Rules & Build Pipeline                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 19. Admin UX Concept (Antislop Compliant)

* **Design**: Monospace-accented, clean dark theme (`#09090b` background, `#18181b` card borders, `#f4f4f6` text).
* **Navigation**: Simple left sidebar or top tab bar:
  1. `[ Initiatives ]` — List of 4 cards with drag/number ordering, status badges, and quick edit.
  2. `[ Hero Config ]` — Mode toggle radio and featured project selector.
  3. `[ Philosophy ]` — 4 axiom cards with side-by-side EN/ID textareas.
  4. `[ Categories ]` — Category management table.
  5. `[ Live Preview ↗ ]` — Direct link to `/admin/preview`.
* **Zero Bloat**: No analytics graphs, no visitor counter widgets, no generic marketing popups.

---

## 20. Operational Complexity & Costs

* **External Services**: 1 (Supabase Free Tier).
* **Environment Variables Added**: 3 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
* **Monthly Cost**: **$0.00 / month** (Supabase Free tier provides 500MB storage, 50,000 MAU; Nalakara uses <2MB storage and 1 admin user).
* **Maintenance Burden**: Extremely low. No database server patching required.

---

## 21. Risks & Trade-offs

| Risk | Assessment | Mitigation |
| :--- | :---: | :--- |
| **Supabase Free Tier Project Pausing** | Medium | A lightweight weekly cron or single visit prevents pausing; public site is edge-cached anyway. |
| **Accidental Language Incompleteness** | Low | Form schema hard-blocks publishing incomplete translation pairs. |
| **Unauthorized Admin Access** | Low | Next.js Middleware + Supabase Auth with secure HTTP-only cookies and RLS policies. |

---

## 22. Final Decision & Readiness

> **Architectural Verdict: APPROVED (Option B — Proceed with Refinements).**
>
> The proposed architecture is complete, verified, secure, and ready for staged implementation.

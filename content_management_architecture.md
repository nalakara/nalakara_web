# Nalakara Web — Content Management Architecture

This document establishes the architecture for introducing an administrative content-management capability into **Nalakara Web**, enabling the studio owner to perform routine content updates independently of coding agents or source-code modifications while strictly preserving the site's editorial integrity, performance, and visual discipline.

---

## 1. Current Architecture

The current **Nalakara Web (v1.1)** is a high-performance, single-page editorial ecosystem registry deployed on Vercel:

* **Framework**: Next.js 15+ (App Router), React 19, TypeScript.
* **Rendering Strategy**: 100% Static Site Generation (`next build` prerenders static HTML/JS bundles).
* **Data Sources**: Hard-coded TypeScript files:
  * `src/data/ecosystem.ts`: Initiative records, studio principles, and studio metadata.
  * `src/data/i18n.ts`: Typed bilingual UI translation dictionaries (EN/ID).
* **State & Localization**: Handcrafted `LanguageContext` (`LanguageProvider`) syncing client preference via `localStorage` and dynamic `<html lang="...">` attributes.
* **Styling**: Handcrafted Vanilla CSS Modules with strict CSS custom properties (`globals.css`).
* **Bundle Footprint**: Ultra-lean (First Load JS: ~113 kB, 0 external UI/runtime i18n libraries).

---

## 2. Problem Definition

In v1.1, changing a project tagline, adding an initiative, updating an availability badge, or tweaking a philosophy principle requires:
1. Opening the repository.
2. Editing TypeScript source files (`ecosystem.ts` or `i18n.ts`).
3. Running type checks and build scripts.
4. Committing and pushing to Git to trigger a Vercel rebuild.

This creates high friction for routine editorial updates and tightly couples content updates with codebase versioning.

### Desired Transition
* **Current Model**: `TypeScript Source Files` $\rightarrow$ `Next.js Build` $\rightarrow$ `Vercel Static Prerender`
* **Future Model**: `Admin Interface (/admin)` $\rightarrow$ `Lightweight Content Store` $\rightarrow$ `Next.js ISR / On-Demand Revalidation` $\rightarrow$ `Vercel Edge Distribution`

---

## 3. Requirements

1. **Owner Autonomy**: The owner can create, edit, archive, and reorder initiatives, principles, categories, and hero configurations without code changes.
2. **Structural Safety**: The design system, lifecycle taxonomy, canvas coordinates, typography scale, and layout hierarchy cannot be modified or broken via the admin UI.
3. **Bilingual Parity**: English and Indonesian fields are managed as paired first-class entities with completeness checks.
4. **Zero Performance Regression**: The public-facing site must remain as fast as the static baseline (leveraging Incremental Static Regeneration / Next.js cache revalidation).
5. **Operational Simplicity**: Avoid heavy microservices, complex headless CMS tiers, or bloated third-party SDKs.

---

## 4. Storage Options Evaluation

### Option A — Git-Backed Flat Files (e.g., GitHub API / Decap CMS / JSON files committed via API)
* *Mechanism*: Admin updates content by triggering GitHub API commits directly to JSON files in the repo.
* *Pros*: Zero external database cost, full Git history and rollback natively.
* *Cons*: High publishing latency (every edit requires a full 30–60s Vercel build), fragile API authentication tokens, poor real-time draft/preview experience, rate limits.

### Option B — Managed Relational Database (Supabase / Neon PostgreSQL)
* *Mechanism*: Structured relational tables with Next.js App Router Server Actions and Row-Level Security (RLS).
* *Pros*: Instant writes, robust relational integrity (foreign keys prevent orphaned categories), native authentication, on-demand cache revalidation via `revalidatePath()`, instant draft previews, free tier readily available.
* *Cons*: Requires managing an external database connection and environment variables.

### Option C — Hosted Headless CMS (Sanity / Contentful / Directus)
* *Mechanism*: Third-party managed SaaS content repository.
* *Pros*: Pre-built admin dashboard, media handling, visual preview plugins.
* *Cons*: Vendor lock-in, monthly cost risk, schema divergence between CMS and bespoke Next.js UI, heavy client SDKs, unnecessary enterprise complexity for a focused studio site.

### Option D — Minimal Document Store (Vercel KV / Upstash Redis / Cloud Firestore)
* *Mechanism*: Key-value or single document JSON blobs.
* *Pros*: Simple setup, low operational overhead.
* *Cons*: Lacks relational constraints (risk of orphaned category IDs or inconsistent foreign keys), manual transactional handling.

---

## 5. Decision Matrix

| Criteria | Weight | Option A: Git-Backed | Option B: PostgreSQL (Supabase) | Option C: Hosted CMS | Option D: KV / Document |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Simplicity & Zero Bloat** | 20% | 7/10 | **9/10** | 5/10 | 8/10 |
| **Owner Editing UX & Speed** | 20% | 4/10 | **9/10** | 9/10 | 7/10 |
| **Content Safety & Relational Integrity** | 20% | 5/10 | **10/10** | 8/10 | 4/10 |
| **Bilingual Support & Draft/Preview** | 15% | 4/10 | **9/10** | 9/10 | 6/10 |
| **Cost & Operational Maintenance** | 15% | 9/10 | **9/10** | 4/10 | 8/10 |
| **Vercel / Next.js Native Fit** | 10% | 6/10 | **10/10** | 7/10 | 9/10 |
| **Weighted Total Score** | **100%** | **5.75 / 10** | **9.25 / 10** | **6.85 / 10** | **6.90 / 10** |

---

## 6. Recommended Architecture

**Recommendation: Lightweight PostgreSQL via Supabase + Next.js App Router Server Actions + On-Demand Revalidation.**

```
┌────────────────────────────────────────────────────────────┐
│                    Nalakara Admin (/admin)                 │
│              - Protected by Supabase Auth (Magic Link)     │
│              - Restrained, monospace/editorial dashboard   │
│              - Draft preview & instant publishing controls │
└─────────────────────────────┬──────────────────────────────┘
                              │ Server Actions / REST
                              ▼
┌────────────────────────────────────────────────────────────┐
│           Relational Database (PostgreSQL / Supabase)      │
│   [Initiatives]  [Categories]  [Principles]  [SiteConfig]  │
│         ├── status: 'draft' | 'published'                  │
│         └── localized JSONB / relational schemas           │
└─────────────────────────────┬──────────────────────────────┘
                              │
                    On-Demand Revalidation
                  (`revalidatePath('/')`)
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│              Public Frontend (nalakara.com)                │
│    - Serves statically cached ISR pages from Vercel Edge   │
│    - Instant load time (~113 kB JS, 0 DB query at edge)    │
│    - Rebuilds cache only when admin hits "Publish"         │
└────────────────────────────────────────────────────────────┘
```

### Why this is optimal:
1. **Public Site Remains Purely Static**: Visitors hit pre-rendered static HTML at Vercel's edge. The database is never queried during normal public page visits.
2. **Instant Publishing**: When the owner clicks "Publish", `revalidatePath('/')` purges Vercel's cache in <200ms without triggering a 1-minute Git deployment.
3. **Draft & Live Separation**: The owner can preview unpublished draft copy on a secret preview route (`/preview`) before making it public.
4. **Relational Safety**: Foreign keys guarantee that deleting or archiving a category cannot orphan active initiatives.

---

## 7. Content Model

To prevent breaking layout and styling, content fields are strictly bifurcated into **System-Controlled Fields** (restricted options) and **Editorial Fields** (open text with length limits).

### 7.1 Entity: `Initiative` (`initiatives` table)

| Field | Type | Control | Description & Validation |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` / `TEXT` | System | Immutable primary key (e.g. `bros`, `roast-navigator`). |
| `slug` | `VARCHAR(64)` | System | URL-safe slug, unique. |
| `name` | `VARCHAR(64)` | Editorial | Initiative display title (e.g. `B.R.O.S.`). |
| `category_id` | `FK -> categories.id` | System | Relational reference to valid category. |
| `lifecycle` | `ENUM` | System | Restricted: `'idea' \| 'lab' \| 'project' \| 'product' \| 'commercial'`. |
| `availability` | `ENUM` | System | Restricted: `'concept' \| 'private-alpha' \| 'public-beta' \| 'production' \| 'commercial'`. |
| `tagline_en` | `VARCHAR(120)` | Editorial | Concise English subtitle. |
| `tagline_id` | `VARCHAR(120)` | Editorial | Concise Indonesian subtitle. |
| `description_en` | `TEXT` | Editorial | Max 280 chars; English paragraph description. |
| `description_id` | `TEXT` | Editorial | Max 280 chars; Indonesian paragraph description. |
| `target_url` | `VARCHAR(255)` | Editorial | Optional external URL (null if unlaunched). |
| `is_external` | `BOOLEAN` | System | Whether link opens in new tab. |
| `featured` | `BOOLEAN` | Editorial | If `true`, rendered in "Current Initiatives" section. |
| `commercial_badge_en`| `VARCHAR(40)` | Editorial | Optional badge (e.g. `Commercial Candidate`). |
| `commercial_badge_id`| `VARCHAR(40)` | Editorial | Optional badge in Indonesian. |
| `sort_order` | `INTEGER` | Editorial | Integer sequence for display ordering. |
| `status` | `ENUM` | System | `'draft' \| 'published' \| 'archived'`. |
| `updated_at` | `TIMESTAMPTZ` | System | Automated timestamp. |

---

## 8. Hero Model

Rather than duplicating text fields, the Hero model controls presentation mode and references entities cleanly.

### Entity: `HeroConfig` (`hero_config` table)

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `VARCHAR(32)` | Singleton identifier (`primary`). |
| `mode` | `ENUM('studio', 'featured_initiative')` | Default is `studio` (editorial manifesto); can switch to highlight a specific project. |
| `featured_initiative_id`| `FK -> initiatives.id` | Nullable reference when `mode = 'featured_initiative'`. |
| `custom_headline_en` | `VARCHAR(120)` | Nullable override; defaults to studio tagline if empty. |
| `custom_headline_id` | `VARCHAR(120)` | Nullable Indonesian override. |
| `custom_subhead_en` | `TEXT` | Nullable English subhead override. |
| `custom_subhead_id` | `TEXT` | Nullable Indonesian subhead override. |
| `show_lifecycle_bar` | `BOOLEAN` | Toggle visibility of the 5-stage progress indicator. |

---

## 9. Category Model

Categories are normalized relational entities to prevent typographical inconsistency.

### Entity: `Category` (`categories` table)

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `VARCHAR(32)` | Slug ID (e.g. `software`, `digital-system`, `experimental`). |
| `name_en` | `VARCHAR(64)` | English label (e.g. `Software`, `Digital System`). |
| `name_id` | `VARCHAR(64)` | Indonesian label (e.g. `Perangkat Lunak`, `Sistem Digital`). |
| `sort_order` | `INTEGER` | Sorting sequence. |
| `is_active` | `BOOLEAN` | Whether active in Registry filter tabs. |

**Integrity Rule**: A category cannot be deleted if any non-archived initiative references its `id`. The admin UI must prompt re-assigning initiatives before allowing deletion.

---

## 10. Lifecycle & Availability Model

To protect Nalakara's conceptual architecture, lifecycle and availability values are **hard-coded database ENUMs**. The admin interface cannot invent new states.

### Allowed Lifecycle Stages:
1. `idea` (`01 Idea` / `01 Gagasan`)
2. `lab` (`02 Lab`)
3. `project` (`03 Project` / `03 Proyek`)
4. `product` (`04 Product` / `04 Produk`)
5. `commercial` (`05 Commercial` / `05 Komersial`)

### Allowed Availability Models:
1. `concept` (`Concept Drafting` / `Konsep`)
2. `private-alpha` (`Private Alpha` / `Akses Terbatas`)
3. `public-beta` (`Public Beta` / `Beta Publik`)
4. `production` (`Public Utility` / `Siap Pakai`)
5. `commercial` (`Commercial Offering` / `Layanan Komersial`)

---

## 11. Bilingual Content Model & Validation

Content fields are stored side-by-side on the same record (e.g., `tagline_en` and `tagline_id`), guaranteeing atomic transactions.

### Publishing Quality Rules:
1. **Draft State**: An initiative can be saved as a draft with only one language completed.
2. **Publish Block**: The admin UI will disallow setting `status = 'published'` unless **both** English and Indonesian fields are filled.
3. **Character Limits**: Enforced at the form layer to prevent card overflow (Taglines $\le 120$ chars, Descriptions $\le 280$ chars).

---

## 12. Publishing Model

A simple two-state publishing workflow balances control with low friction:

```text
[ EDIT FORM ] ──> [ SAVE DRAFT ] ──> (View in /admin/preview)
                         │
                         ▼
                   [ PUBLISH ] ──> (Triggers revalidatePath('/')) ──> [ LIVE ON NALAKARA.COM ]
```

* **Draft**: Edits are persisted in PostgreSQL with `status = 'draft'` without affecting the live static cache.
* **Preview**: The owner can inspect drafts in real time on the actual website layout.
* **Publish**: Sets `status = 'published'`, writes timestamp, and executes Next.js on-demand revalidation.

---

## 13. Preview Model

* Route: `/admin/preview` (Protected by authentication).
* The preview route renders the exact public page component tree (`<Header />`, `<Hero />`, `<Initiatives />`, `<Registry />`, `<Philosophy />`, `<Footer />`) using draft data fetched directly from the database.
* Features a persistent floating preview toolbar with an active language switcher (`EN | ID`) and a one-click **"Publish to Live"** button.

---

## 14. Authentication & Security

* **Target Audience**: Single Owner / Administrator.
* **Mechanism**: Supabase Auth using **Passwordless Magic Links** or secure Email/Password.
* **Protection**: Next.js Middleware (`src/middleware.ts`) intercepting all `/admin/*` and `/api/admin/*` routes, redirecting unauthenticated requests to `/admin/login`.
* **Database Security**: Row-Level Security (RLS) policies allowing public `SELECT` on `status = 'published'`, but restricting all `INSERT`, `UPDATE`, and `DELETE` operations to authenticated service roles.

---

## 15. Admin UX Principles

In strict alignment with Nalakara's antislop and design philosophy, the admin interface must **avoid generic SaaS dashboard slop**:

* **No Clutter**: Zero vanity charts, fake analytics cards, animated greeting banners, or heavy widget grids.
* **Aesthetic**: Restrained dark theme matching Nalakara (`#09090b` background, `#121215` cards, monospace coordinates, high-contrast typography).
* **Speed**: Fast keyboard navigation, inline sorting, and immediate form feedback.
* **Purpose-Driven**: An editorial tool for craftsmen, not an enterprise portal.

---

## 16. Validation & Content Safety (Antislop at Data Level)

The CMS form schemas enforce antislop constraints programmatically:

1. **Buzzword Warning**: Flags banned AI marketing buzzwords (*"revolutionary"*, *"AI-powered"*, *"next-generation"*) before saving.
2. **Punctuation Check**: Disallows unapproved em dashes (`—`) in text fields, prompting colons or clean commas.
3. **URL Validation**: Ensures external URLs begin with `https://` and flags broken/unreachable domains.
4. **Availability Integrity**: If `status = 'project'` and `availability = 'private-alpha'`, warns if the user attempts to enter live production marketing copy.

---

## 17. Migration Strategy

Migration from static files to the content store will be completely lossless:

1. **Database Provisioning**: Execute SQL schema migration creating `initiatives`, `categories`, `principles`, and `site_config`.
2. **Seed Script**: Run a deterministic TypeScript seed script (`scripts/seed-cms.ts`) reading directly from current `src/data/ecosystem.ts` and `src/data/i18n.ts`.
3. **Verification**: Confirm that database records match the frozen v1.1 data 1-to-1.
4. **Public Layer Handoff**: Public data-fetching layer seamlessly switches from local static arrays to database reads with Next.js static caching.

---

## 18. Future Extensibility (Non-Breaking)

The schema easily supports future evolution without requiring structural redesigns:
* **Detail Pages**: Adding a markdown `body_en` / `body_id` column to `initiatives` enables individual project pages (`/initiatives/[slug]`).
* **Media Assets**: Adding `cover_image_url` column when screenshots are ready.
* **Journal / Notes**: A future `posts` table using the same bilingual publishing lifecycle.

---

## 19. Staged Implementation Phases

* **Phase 1 — Schema & Database Setup**: Provision Supabase instance, establish tables, foreign keys, RLS policies, and run the seed script.
* **Phase 2 — Backend Data Access Layer**: Create type-safe data access functions in Next.js (`src/lib/cms/`) with caching tags.
* **Phase 3 — Admin UI & Authentication**: Build minimal `/admin/login`, `/admin/initiatives`, `/admin/philosophy`, and `/admin/hero` using Next.js Server Actions and Vanilla CSS Modules.
* **Phase 4 — Preview & Revalidation**: Build `/admin/preview` and connect `revalidatePath('/')` on publish.
* **Phase 5 — Testing & Freeze**: Audit authentication security, verify 100% static edge caching on public routes, and conduct final manual review.

---

## 20. Risks & Trade-offs

| Risk | Mitigation |
| :--- | :--- |
| **Accidental database latency on public visits** | Zero DB calls on public requests; public routes read exclusively from Next.js static cache / Vercel Edge. |
| **Breaking visual layouts via admin input** | Strict character length limits, hard-coded lifecycle ENUMs, and non-editable layout structure. |
| **Accidental broken links / orphaned data** | PostgreSQL foreign keys with `RESTRICT` on delete, URL format validation. |

---

## 21. Final Recommendation

> **The simplest, most robust architecture that grants the owner complete editorial independence without Antigravity is a Supabase PostgreSQL instance coupled directly with Next.js App Router Server Actions and On-Demand Cache Revalidation.**

* **The owner controls**: Taglines, descriptions, initiative ordering, categories, availability statuses, philosophy texts, and hero presentation mode in both English and Indonesian.
* **The code controls**: Canvas physics, mathematical node algorithms, responsive layouts, color systems, typography tokens, and lifecycle taxonomy definitions.

This guarantees that Nalakara Web retains its sub-second static speed and distinctive visual identity while providing effortless day-to-day management.

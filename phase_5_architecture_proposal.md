# Phase 5 Architecture Proposal: Public Source Migration & Cutover

**Document**: Phase 5 Architecture Audit & Implementation Plan  
**Target Milestone**: Phase 5 (Public Source Migration & Cutover)  
**Status**: **PROPOSAL FOR REVIEW**  
**Date**: 31 August 2026  

---

## A. Current Architecture

1. **Public Route (`/`)**:
   - Next.js App Router root page (`src/app/page.tsx`).
   - Sourced synchronously at render time from static TypeScript data modules:
     - `src/data/ecosystem.ts` (`ECOSYSTEM_INITIATIVES`, `STUDIO_PRINCIPLES`, `STUDIO_META`).
     - `src/data/i18n.ts` (`DICTIONARY` supporting client-side `LanguageContext`).
   - Fully prerendered as a static page (`○ (Static)`).
2. **Admin Content Console (`/admin/*`)**:
   - Next.js dynamic server components (`ƒ (Dynamic)`).
   - Writes directly to Supabase PostgreSQL database under single-owner security verification (`verifyOwner()`).
3. **Admin Live Preview (`/admin/preview`)**:
   - Next.js dynamic server page (`ƒ (Dynamic)`).
   - Injects live Supabase data (including drafts flagged with `[DRAFT]`) directly into public components (`Hero`, `Initiatives`, `Registry`, `Philosophy`).
4. **Publishing & Revalidation Engine (`src/lib/cache/revalidate.ts`)**:
   - Centralized revalidation engine established in Phase 4 (`772a111`).
   - Dispatches post-commit `revalidateTag(CACHE_TAGS.ECOSYSTEM)` and `revalidatePath('/')` upon any content change.

---

## B. Exact Source-of-Truth Gap

* In Phase 4, the revalidation engine fires `revalidateTag('ecosystem')` and `revalidatePath('/')`, but the public route (`src/app/page.tsx`) still reads hardcoded arrays from `src/data/ecosystem.ts`.
* Changes published in the Content Console persist to Supabase PostgreSQL and render in `/admin/preview`, but cannot appear on the public homepage (`/`).
* **Phase 5 Goal**: Transition `src/app/page.tsx` to consume a cached, published-only Supabase Data Access Layer (DAL) wrapped with Next.js cache tags (`unstable_cache`), while retaining `src/data/ecosystem.ts` as a reliable in-memory fallback.

---

## C. Recommended Public Data Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SUPABASE POSTGRESQL                             │
│  - initiatives (publication_status = 'published')                      │
│  - categories (is_active = true)                                       │
│  - hero_config (id = 'primary')                                        │
│  - studio_principles (publication_status = 'published')                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Server-Side Fetch (Public Role / Anon)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│      PUBLIC DATA ACCESS LAYER (src/lib/supabase/public.ts)             │
│  - getPublicEcosystemData() wrapped in Next.js `unstable_cache`        │
│  - Cache Tag: `CACHE_TAGS.ECOSYSTEM` ('ecosystem')                     │
│  - Strict Predicate Enforcement: Drafts & Archived strictly filtered   │
│  - Observable Local Fallback if DB is unavailable                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Cached Payload (zero client DB roundtrips)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     PUBLIC HOMEPAGE (src/app/page.tsx)                 │
│  - Server Component passing data into public UI components:             │
│    <Hero config={data.heroConfig} />                                   │
│    <Initiatives items={data.featuredInitiatives} />                    │
│    <Registry items={data.initiatives} />                               │
│    <Philosophy principles={data.principles} />                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## D. Rendering & Caching Model Evaluation

### Comparison of Options:
1. **Option A: Static Page (SSG) with On-Demand Revalidation (`revalidateTag` / `revalidatePath`)** [RECOMMENDED]:
   - Next.js App Router prerenders `/` at build time using the cached `getPublicEcosystemData()`.
   - When an admin publishes in the console, `revalidateEcosystemCache()` purges the `'ecosystem'` cache tag and `/` route path.
   - The very next visitor receives freshly rendered HTML which is then cached at the edge.
   - **Why this is optimal**: Delivers sub-millisecond edge response times (identical to static files) while supporting instant on-demand updates upon publication. Zero client-side Supabase bundle or connection overhead.
2. **Option B: Pure Dynamic Server-Side Rendering (`force-dynamic`)**:
   - Query Supabase on every single HTTP request.
   - **Drawback**: Increases latency, incurs unnecessary database roundtrips for unchanged content, and vulnerable to DB load spikes.
3. **Option C: Client-Side Fetching (SWR / React Query)**:
   - **Rejected**: Exposes database endpoints/keys to client, creates layout shift (CLS), destroys SEO crawling, and violates repository design principles.

**Conclusion**: **Option A** (Statically cached server rendering with on-demand tag revalidation via `unstable_cache`) is the best architectural fit.

---

## E. Data-Fetching Contract & Cache Aggregation

### Single Unified Query vs. Multiple Independent Queries:
* **Recommendation**: **One Unified Public Cached Query (`getPublicEcosystemData`)**.
* **Rationale**:
  - The public homepage is a cohesive editorial artifact: when an initiative is published, the Hero spotlight, the featured initiatives grid, the complete registry, and categories must all be chronologically and relationally coherent.
  - Slicing into multiple small caches introduces cache synchronization hazards (e.g., Hero spotlight pointing to an initiative that a separate cache tag hasn't updated yet).
  - Executing `Promise.all` inside `getPublicEcosystemData` and caching the unified payload under `CACHE_TAGS.ECOSYSTEM` guarantees atomic editorial snapshots and simpler revalidation.

---

## F. Fallback Policy

We define a clear, observable 5-tier fallback policy:

| Scenario | Behavior | Log Level / Observability | Source Flag |
| :--- | :--- | :--- | :---: |
| **1. Normal Operation** | Return live Supabase published records. | None | `'database'` |
| **2. Supabase Query Error / Timeout** | Catch error, fallback to `ECOSYSTEM_INITIATIVES` & `STUDIO_PRINCIPLES`. | `console.error` with error message | `'static-fallback'` |
| **3. Database Empty / Inconsistent (0 published initiatives)** | Fallback to `src/data/ecosystem.ts` to prevent broken blank homepage. | `console.warn('Empty initiatives in DB, using fallback')` | `'static-fallback'` |
| **4. Hero Config Missing in DB** | Fallback to default `{ mode: 'studio', showLifecycleBar: true }`. | `console.warn('Hero config missing, using default')` | `'static-fallback'` |
| **5. Build-Time Offline Generation** | If Supabase unreachable during `next build`, compile cleanly using static fallback. | Build succeeds safely without blocking CI/CD | `'static-fallback'` |

---

## G. Source-of-Truth Mapping (CMS vs. System UI)

| Content Entity | Source in Phase 5 | Rationale |
| :--- | :---: | :--- |
| **Initiatives Registry** | Supabase (`initiatives`) | Dynamic editorial CMS data. |
| **Categories Taxonomy** | Supabase (`categories`) | CMS taxonomy linking initiatives. |
| **Hero Singleton Presentation** | Supabase (`hero_config`) | Dynamic studio mode / featured spotlight. |
| **Studio Principles** | Supabase (`studio_principles`) | Dynamic studio axioms. |
| **Static Navigation, Headers, Footers** | `src/data/i18n.ts` | Permanent application UI chrome. |
| **Foundry Field & Stage Labels** | `src/data/i18n.ts` | Immutable physics/lifecycle UI definitions. |
| **SEO Meta Defaults & Schema.org** | `src/app/layout.tsx` | Static studio identity & metadata base. |

---

## H. Bilingual Contract

* **Native Bilingual Equivalence**: The database columns (`tagline_en`, `tagline_id`, `description_en`, `description_id`, `title_en`, `title_id`) map directly into `{ en: string, id: string }` records.
* **No Hierarchy**: English and Indonesian remain parallel expressions.
* **Seamless Language Toggle**: The existing `LanguageContext` selects `item.name`, `item.tagline[lang]`, and `item.description[lang]` exactly as it does today.

---

## I. SEO & Metadata Implications

* OpenGraph and base metadata in `src/app/layout.tsx` represent the overarching Studio & Foundry identity and do not require per-request DB dynamic generation.
* Canonical URLs, Schema.org JSON-LD, and Twitter cards remain fast and static in `src/app/layout.tsx`.
* Prerendered HTML on `/` contains complete bilingual content in the DOM, preserving perfect search engine indexability.

---

## J. Performance Model & Acceptance Criteria

1. **Sub-second Edge Response**: Serving `/` requires 0 DB queries at runtime (served from Next.js data cache).
2. **Zero Bundle Impact**: Zero Supabase client libraries bundled into the public homepage client JS chunk.
3. **Zero Secret Leakage**: `SUPABASE_SERVICE_ROLE_KEY` is not imported anywhere in public data access paths.
4. **Instant Invalidation**: Upon clicking "Publish" or "Update", `revalidateEcosystemCache` purges the cache, and the next request rebuilds the static snapshot.

---

## K. Cutover Plan

1. **Step 1**: Implement `src/lib/supabase/public.ts` with `getPublicEcosystemData()` wrapped in `unstable_cache`.
2. **Step 2**: Create automated unit & parity test `scripts/test-phase-5-cutover.ts` to assert that `getPublicEcosystemData()` returns data 100% semantically equal to `src/data/ecosystem.ts`.
3. **Step 3**: Update `src/app/page.tsx` to call `await getPublicEcosystemData()` and pass data into `<Hero />`, `<Initiatives />`, `<Registry />`, `<Philosophy />`.
4. **Step 4**: Verify `npm run build` generates 11/11 pages with `/` as cached static (`○`).
5. **Step 5**: Run full regression test suite (Phase 1, 2B, 2C, 3, 4, 5).

---

## L. Rollback Plan

If unexpected production issues arise post-cutover:
* **Immediate Rollback Mechanism**: Set an environment variable `PUBLIC_FORCE_STATIC_FALLBACK=true` or revert `src/app/page.tsx` to import directly from `@/data/ecosystem`.
* Because `src/data/ecosystem.ts` remains intact, reverting takes less than 30 seconds and requires 0 database rollbacks.

---

## M. Test Strategy

We will build `scripts/test-phase-5-cutover.ts` covering:
1. **Public Predicate Integrity**: Assert `publication_status = 'draft'` and `publication_status = 'archived'` are never included in the public payload.
2. **Semantic Parity**: Assert the 4 canonical initiatives match `src/data/ecosystem.ts` field-for-field.
3. **Hero & Principle Invariants**: Assert hero mode and 4 principles map cleanly.
4. **Fallback Verification**: Simulate Supabase connection failure and verify graceful fallback to static data.
5. **Cache Tag Contract**: Verify cache invalidation triggers properly.

---

## N. Files Expected to Change

- `src/lib/supabase/public.ts` `[NEW]`: Cached public Data Access Layer.
- `src/app/page.tsx` `[MODIFY]`: Async Server Component passing cached data into components.
- `scripts/test-phase-5-cutover.ts` `[NEW]`: Comprehensive Phase 5 verification test.
- `PROJECT_STATUS_MEMO.md` `[MODIFY]`: Update status upon Phase 5 completion.
- `phase_5_execution_report.md` `[NEW]`: Freeze report.

---

## O. Files Explicitly Forbidden to Change

- `supabase/schema.sql` (No DDL or RLS modifications).
- `src/data/ecosystem.ts` & `src/data/i18n.ts` (Preserved as fallback).
- `src/context/LanguageContext.tsx` (Language system frozen).
- `src/components/Header.tsx`, `Footer.tsx` (System UI frozen).
- `src/app/admin/*` (Admin architecture frozen).

---

## P. Risks & Mitigations

| Risk | Mitigation |
| :--- | :--- |
| **Supabase Cold Start / Outage** | Handled transparently by `unstable_cache` and in-memory static fallback. |
| **Draft Leakage to Public** | Guaranteed by `.eq('publication_status', 'published')` query predicate and RLS public read policies. |
| **Bilingual Mapping Desynchronization** | Parity tests assert 1:1 matching across all EN/ID fields before build. |

---

## Q. Definition of Done

- [ ] `getPublicEcosystemData()` implemented with `unstable_cache(['ecosystem'])`.
- [ ] `src/app/page.tsx` rendering cached Supabase data.
- [ ] All public regression tests pass.
- [ ] Next.js production build succeeds with `/` as static/cached.
- [ ] Manual verification on live server confirms publishing in Admin updates `/`.

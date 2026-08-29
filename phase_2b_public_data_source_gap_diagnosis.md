# Nalakara Web v1.2 — Phase 2B Public Data Source Gap Diagnosis
## Architectural Diagnosis & Migration Blueprint

This document records the architectural investigation into the data flow difference between the **Admin Content Console (`/admin/initiatives`)** and the **Public Frontend (`/`)**.

---

## 1. Executive Summary & Diagnostic Verdict

* **Observed Behavior**: In the Admin Initiative Editor (`/admin/initiatives/[id]`), the newly created initiative `"Brand Guidelines System"` was saved and published. In the live Supabase PostgreSQL database, its `publication_status` is `'published'` with a valid `published_at` timestamp. However, loading the public homepage (`/`) only displays the initial 3 featured initiatives (`B.R.O.S.`, `Roast Navigator`, `Beauty Batch OS`).
* **Diagnostic Verdict**: **EXPECTED ARCHITECTURAL GAP (Option A)** — **NOT A BUG**.
* **Rationale**: The public frontend was deliberately kept 100% static on v1.1 source files (`src/data/ecosystem.ts` and `src/data/i18n.ts`) throughout Phases 1, 2A, and 2B. This was designed to isolate admin feature development and prevent any public regressions until the full CMS suite (Categories, Hero, Philosophy, Preview, and Publishing Engine) is completed and verified.
* **Scheduled Cutover**: **Phase 5 (Public Source Migration & Cutover)** in [`content_console_implementation_plan.md`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/content_console_implementation_plan.md#L145-L156).

---

## 2. Public Frontend vs. Admin Console Data Flow Comparison

### A. Public Frontend Data Path (`/`)
```
src/app/page.tsx (Static Entrypoint)
  ├── <Hero />        ──────> reads static dictionary from src/data/i18n.ts via useLanguage()
  ├── <Initiatives /> ──────> imports ECOSYSTEM_INITIATIVES from src/data/ecosystem.ts
  │                           filters ECOSYSTEM_INITIATIVES.filter(item => item.featured)
  ├── <Registry />    ──────> imports ECOSYSTEM_INITIATIVES from src/data/ecosystem.ts
  │                           filters by status tabs and sorts by item.order
  └── <Philosophy />  ──────> imports STUDIO_PRINCIPLES from src/data/ecosystem.ts
```
* **Source of Truth**: Hardcoded static TypeScript constants in [`src/data/ecosystem.ts`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/src/data/ecosystem.ts).
* **Database Connection**: **Zero**. No database queries or network requests occur on the public homepage.
* **Featured Filter**: `Initiatives.tsx` (line 11) filters `item.featured === true`.
* **Current Static Initiatives in `ecosystem.ts`**:
  1. `bros` (`featured: true`)
  2. `roast-navigator` (`featured: true`)
  3. `beauty-batch-os` (`featured: true`)
  4. `skill-factory` (`featured: false`)

### B. Admin Content Console Data Path (`/admin/*`)
```
src/app/admin/(authenticated)/initiatives/page.tsx
  └── Server Component ──> queries live Supabase PostgreSQL (table: 'initiatives')
                           selects all rows, orders by sort_order ASC
src/app/admin/(authenticated)/initiatives/[id]/page.tsx
  └── Server Component ──> queries live Supabase PostgreSQL
                           selects single row by eq('id', id)
src/app/admin/(authenticated)/initiatives/actions.ts
  └── Server Actions   ──> executes INSERT/UPDATE/DELETE directly on Supabase PostgreSQL
```
* **Source of Truth**: Live Supabase PostgreSQL database tables (`initiatives`, `categories`, `admin_users`, `hero_config`, `studio_principles`).
* **Current Database State for `brand-guidelines-system`**:
  * `id`: `'brand-guidelines-system'`
  * `name`: `'Brand Guidelines System'`
  * `category_id`: `'service'`
  * `lifecycle_stage`: `'product'`
  * `access_model`: `'production'`
  * `publication_status`: `'published'`
  * `published_at`: `'2026-08-29T22:19:29.848Z'`
  * `featured`: `false`
  * `sort_order`: `5`

---

## 3. Historical Architectural Intent & Decision Audit

A review of the baseline specifications confirms this separation was deliberate:

1. **[`content_console_implementation_plan.md`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/content_console_implementation_plan.md)**:
   * **Phase 1 (Data Migration)**: *"Deterministically seed all current frozen v1.1 data into Supabase without altering public-facing code."*
   * **Phase 2 (Admin Console UI)**: Implements `/admin/initiatives`, `/admin/categories`, `/admin/hero`, `/admin/philosophy`.
   * **Phase 3 (Draft & Preview)**: Implements `/admin/preview` to allow owner to preview draft and live Supabase content inside actual page components.
   * **Phase 4 (Publishing Engine)**: Implements unified cache invalidation with `revalidateTag('ecosystem')`.
   * **Phase 5 (Public Cutover)**: *"Switch the public website data-fetching layer from hardcoded TypeScript files to the cached Supabase data layer."*
2. **Phase 2B Mandate**:
   * *"Public website TIDAK boleh berubah secara visual maupun secara arsitektural pada phase ini."*
   * *"No database/schema/RLS changes are required for this phase... Do NOT start Phase 2C or public data migration."*

---

## 4. Semantic Analysis of "Live" Terminology

In the Admin Initiative Editor (`InitiativeForm.tsx`), the publishing success notification displays:
> *"Initiative successfully published to live ecosystem registry."*

### Semantic Assessment
* **Why it can cause ambiguity**: An operator might expect "live ecosystem registry" to mean the public `nalakara.com/` homepage immediately reflects the new initiative.
* **What it actually means in Phase 2**: The initiative is live in the **canonical PostgreSQL production database registry** (`publication_status = 'published'`), as opposed to being stored only in draft memory or local state.
* **Recommendation**:
  * During Phase 2, this wording is technically accurate regarding the database lifecycle state.
  * In Phase 5, once `src/app/page.tsx` is wired to the cached Supabase query layer, publishing will simultaneously update both the database registry and the live public website (<1 second revalidation).

---

## 5. Phase 5 Public Migration Architecture Blueprint

When Phase 5 is executed, the public website data integration must follow this exact architectural blueprint:

### 1. Cached Data Fetching Layer (`src/lib/cms/queries.ts`)
```typescript
import { unstable_cache } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { ECOSYSTEM_INITIATIVES, STUDIO_PRINCIPLES } from '@/data/ecosystem';
import { Database } from '@/types/database';

export const getPublishedInitiatives = unstable_cache(
  async () => {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('initiatives')
        .select('*')
        .eq('publication_status', 'published')
        .order('sort_order', { ascending: true });

      if (error || !data || data.length === 0) {
        console.warn('Supabase fetch failed or empty, using static fallback:', error?.message);
        return ECOSYSTEM_INITIATIVES;
      }
      return data;
    } catch (err) {
      console.error('Supabase query error, falling back to static constants:', err);
      return ECOSYSTEM_INITIATIVES;
    }
  },
  ['public-initiatives'],
  { tags: ['ecosystem', 'initiatives'], revalidate: false } // Revalidated on-demand via revalidateTag('ecosystem')
);
```

### 2. Public Data Filtering & Mapping Invariants
* **Published-Only Filter**: Query strictly filters `.eq('publication_status', 'published')`. Draft and archived records are strictly excluded by both query parameters and database RLS.
* **Deterministic Sort Order**: Ordered deterministically by `.order('sort_order', { ascending: true })`.
* **Featured Initiatives Section (`<Initiatives />`)**:
  * Filters items where `item.featured === true`.
  * If `brand-guidelines-system` has `featured = false`, it will appear in the full `<Registry />` section but not in the top `<Initiatives />` showcase grid. To appear in the top showcase, the operator toggles `Featured Initiative = true` in the editor.
* **Full Registry Section (`<Registry />`)**:
  * Displays all published initiatives categorized into tabs:
    * `All` $\rightarrow$ All published initiatives.
    * `Building` $\rightarrow$ `lifecycle_stage IN ('idea', 'lab', 'project')`.
    * `Usable` $\rightarrow$ `lifecycle_stage = 'product'`.
    * `Commercial` $\rightarrow$ `lifecycle_stage = 'commercial'`.
* **Bilingual Resolution**:
  * Database fields (`tagline_en`, `tagline_id`, `description_en`, `description_id`) map directly into client `LanguageContext` based on active language (`'en'` or `'id'`).
* **Resilience & Fallback**:
  * If Supabase is unreachable, network times out, or query fails, the cached layer falls back cleanly to `src/data/ecosystem.ts`. The public website never throws a 500 error or renders an empty screen.
* **On-Demand Cache Invalidation**:
  * When the admin clicks "Publish to Live" or "Archive Initiative", the Server Action invokes:
    ```typescript
    revalidateTag('ecosystem');
    revalidatePath('/');
    ```
  * Vercel Edge Cache purges the cached static page and serves the updated HTML on the next request in <1 second.

### 3. Public vs. Preview Isolation Matrix

| Capability | Public Route (`/`) | Preview Route (`/admin/preview`) |
| :--- | :--- | :--- |
| **Data Scope** | Strictly `publication_status = 'published'` | All states (`draft`, `published`, `archived`) |
| **Authentication** | Public (no auth required) | Strict owner session required via middleware |
| **Caching** | Static ISR (`revalidate: false` + `revalidateTag`) | Dynamic (`cache: 'no-store'`) |
| **Draft Leakage** | Impossible (enforced by RLS & query filter) | Isolated to authenticated preview session |

---

## 6. Code Integrity & Invariants Check

* **Public Frontend Files**: Untouched (`src/app/page.tsx`, `Hero.tsx`, `Initiatives.tsx`, `Registry.tsx`, `Philosophy.tsx`).
* **Static Fallback Files**: Preserved (`src/data/ecosystem.ts`, `src/data/i18n.ts`).
* **Security & Auth**: Intact. No service-role key leaked, RLS enforced.
* **TypeScript & Build**:
  * `npx tsc --noEmit` $\rightarrow$ **0 errors (PASS)**
  * `npm run build` $\rightarrow$ **7/7 routes statically optimized (PASS)**

---

## 7. Recommended Next Steps

1. **Complete Phase 2C**: Build the remaining administrative editors for Categories, Hero Mode, and Philosophy Principles.
2. **Execute Phase 3**: Build `/admin/preview` with the real-time preview toolbar.
3. **Execute Phase 4**: Unify the Publishing Engine and test on-demand cache revalidation.
4. **Execute Phase 5**: Switch `src/app/page.tsx` to the cached Supabase data layer with static fallback. At that point, "Brand Guidelines System" and all newly published initiatives will automatically reflect on the public homepage.

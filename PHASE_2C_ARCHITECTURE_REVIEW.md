# Nalakara Web v1.2 — Phase 2C Architecture Review: Taxonomy & Studio Configuration

**Document Status**: Architecture Specification Baseline  
**Phase**: Phase 2C  
**Author**: Antigravity  
**Target Milestone**: Content Console v1.2  

---

## 1. Executive Architectural Summary

Phase 2C completes the administrative content layer for the Nalakara Content Console by implementing three focused, server-rendered editorial interfaces:
1. **`/admin/categories`**: Category taxonomy management (slug, bilingual labels, sorting, active state).
2. **`/admin/hero`**: Singleton hero presentation configuration (mode selector, featured initiative reference, lifecycle toggle).
3. **`/admin/philosophy`**: Studio principles editor (axiom number, bilingual titles/descriptions, sorting).

**Key Architectural Invariants**:
- **Zero Schema Changes Required**: All three tables (`categories`, `hero_config`, `studio_principles`), ENUMs, triggers, and foreign keys were provisioned and verified in **Phase 0** and seeded in **Phase 1**.
- **Zero RLS Alterations**: Strict owner-only write policies via `admin_users` allowlist are already enforced.
- **Strict Server Action Protection**: All mutation actions verify the owner session through `verifyOwner()` before writing to Supabase.
- **Isolated Public Rendering**: Public pages remain 100% static and decouple from live mutations until **Phase 5 (Public Source Migration & Cutover)**.

---

## 2. Database Schema & Reusability Matrix

The existing Supabase database schema (`supabase/schema.sql`) already contains 100% of the required data models:

```sql
-- Existing Tables Utilized in Phase 2C:

-- 1. Categories (Taxonomy)
TABLE categories (
  id VARCHAR(32) PRIMARY KEY,
  name_en VARCHAR(64) NOT NULL,
  name_id VARCHAR(64) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Hero Singleton Configuration
TABLE hero_config (
  id VARCHAR(16) PRIMARY KEY DEFAULT 'primary',
  mode hero_mode NOT NULL DEFAULT 'studio', -- ENUM ('studio', 'featured_initiative')
  featured_initiative_id VARCHAR(64) REFERENCES initiatives(id) ON DELETE SET NULL,
  show_lifecycle_bar BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT hero_singleton_check CHECK (id = 'primary')
);

-- 3. Studio Principles (Philosophy)
TABLE studio_principles (
  id VARCHAR(32) PRIMARY KEY,
  number VARCHAR(4) NOT NULL, -- e.g. '01', '02', '03', '04'
  title_en VARCHAR(80) NOT NULL,
  title_id VARCHAR(80) NOT NULL,
  description_en TEXT NOT NULL,
  description_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  publication_status publication_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Schema Assessment:
* **Verdict**: **NO SCHEMA CHANGES REQUIRED.**
* All tables have active `trg_*_updated_at` triggers and strict foreign key integrity (`categories.id` $\leftarrow$ `initiatives.category_id` ON DELETE RESTRICT; `initiatives.id` $\leftarrow$ `hero_config.featured_initiative_id` ON DELETE SET NULL).

---

## 3. Route Structure & Component Architecture

Phase 2C introduces the following server components, forms, and server action modules within `src/app/admin/(authenticated)/`:

```
src/app/admin/(authenticated)/
├── categories/
│   ├── page.tsx               <-- Server Component (fetches categories with initiative count)
│   ├── CategoriesTable.tsx    <-- Client Component (interactive table, active toggle, delete guard)
│   ├── CategoryModal.tsx      <-- Client Component (create & edit modal with bilingual inputs)
│   └── actions.ts             <-- Server Actions (create, update, toggleActive, delete)
├── hero/
│   ├── page.tsx               <-- Server Component (fetches hero_config + published initiatives)
│   ├── HeroConfigForm.tsx     <-- Client Component (mode selector, initiative dropdown, toggle)
│   └── actions.ts             <-- Server Actions (updateHeroConfigAction)
└── philosophy/
    ├── page.tsx               <-- Server Component (fetches studio_principles)
    ├── PrinciplesList.tsx     <-- Client Component (axiom list, sequence reordering)
    ├── PrincipleFormModal.tsx <-- Client Component (side-by-side bilingual axiom editor)
    └── actions.ts             <-- Server Actions (updatePrincipleAction, reorderPrinciplesAction)
```

---

## 4. Server Action & Security Boundaries

Every Server Action strictly adheres to the established Phase 2B authorization pattern:

```typescript
// Architectural Security Guard Pattern for Phase 2C Actions:
async function verifyOwner() {
  const isDevBypass =
    process.env.NODE_ENV === 'development' &&
    process.env.ADMIN_DEV_BYPASS === 'true';

  if (isDevBypass) {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    return { supabase: createAdminClient(), isOwner: true };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase: null, isOwner: false };

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .single();

  if (!adminUser) return { supabase: null, isOwner: false };
  return { supabase, isOwner: true };
}
```

### Action Specifications:
1. **`createCategoryAction(formData)`**: Validates slug uniqueness, non-empty bilingual names; inserts into `categories`.
2. **`updateCategoryAction(id, formData)`**: Updates bilingual names and sort order. Slug ID is immutable to prevent breaking foreign keys.
3. **`toggleCategoryActiveAction(id, isActive)`**: Fast boolean update for catalog visibility.
4. **`deleteCategoryAction(id)`**: Checks if any initiatives reference this `id`. If count > 0, returns a structured error without touching the database. If count == 0, deletes the record.
5. **`updateHeroConfigAction(formData)`**: Updates singleton `hero_config`. If `mode === 'featured_initiative'`, validates that `featured_initiative_id` is a valid, published initiative.
6. **`updatePrincipleAction(id, formData)`**: Updates bilingual title, description, and sequence number for a studio principle.

---

## 5. Dependency Graph & Relational Integrity

```
┌─────────────────────────────────────────────────────────────┐
│                       CATEGORIES                            │
│                 (Taxonomy Classification)                   │
└──────────────────────────────┬──────────────────────────────┘
                               │
            1:N (ON DELETE RESTRICT - Protected)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      INITIATIVES                            │
│              (Product & Venture Registry)                   │
└──────────────────────────────┬──────────────────────────────┘
                               │
            1:1 Reference (ON DELETE SET NULL)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      HERO CONFIG                            │
│           (Singleton: Mode & Featured Selector)             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   STUDIO PRINCIPLES                         │
│               (Independent Foundational Axioms)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Architectural Attachment Point: Future Initiative Visual

### Problem Definition:
An initiative will eventually require a visual representation (screenshot, diagram, product render, brand mark) on public and admin cards.

### Structural Recommendation for Phase 2C:
* **Do NOT build media management in Phase 2C.**
* **Document the future schema extension**: When the dedicated **Media & Asset Management Phase** is executed, the following optional columns will be attached to `initiatives`:
  ```sql
  -- Future Media Attachment Point (Documented, NOT implemented in Phase 2C):
  ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS visual_asset_url TEXT;
  ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS visual_alt_en VARCHAR(160);
  ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS visual_alt_id VARCHAR(160);
  ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS visual_type VARCHAR(32) DEFAULT 'render';
  ```
* This isolates media storage, bucket security, CDN caching, and responsive image optimizations into their own dedicated engineering phase without polluting textual content management.

---

## 7. Caching & Cache Invalidation Blueprint (Phase 5 Prep)

* In Phase 2C, all mutations persist immediately to Supabase PostgreSQL.
* Each Server Action triggers Next.js path revalidations for the admin dashboard:
  - `revalidatePath('/admin')`
  - `revalidatePath('/admin/categories')`
  - `revalidatePath('/admin/hero')`
  - `revalidatePath('/admin/philosophy')`
* In **Phase 4 & Phase 5**, publication actions will also invoke `revalidateTag('ecosystem-public')` and `revalidatePath('/')` to update the edge-cached public pages.

---

## 8. Role of Live Preview (`/admin/preview`)

* **Phase Sequencing**: The Live Preview interface (`/admin/preview`) is planned for **Phase 3**.
* **Rationale**: Phase 2C delivers the remaining three content editors (`categories`, `hero`, `philosophy`). Once all four content domains (Initiatives + Categories + Hero + Philosophy) are fully operational in Supabase, Phase 3 will assemble `/admin/preview` to render the entire composite page with live draft data across all sections simultaneously.

---

## 9. Explicit Out-Of-Scope Items for Phase 2C

1. ❌ **Public Frontend Migration**: `src/app/page.tsx` and public components will continue reading static constants.
2. ❌ **Live Preview Toolbar / Route**: `/admin/preview` remains deferred to Phase 3.
3. ❌ **Image / Asset Uploads**: Supabase Storage buckets and file upload UI are deferred to the dedicated Media Phase.
4. ❌ **Arbitrary Hero Typography Customization**: Hero mode continues to select between structured presentation modes.
5. ❌ **Schema Modifications**: No new migrations or DDL statements.

---

## 10. Execution Plan & Phase Gates

When authorized to implement Phase 2C, execution will proceed through 3 modular steps:

1. **Step 1: Categories Console (`/admin/categories`)**
   - Server Component + CategoriesTable + CategoryModal + Server Actions.
   - Foreign key deletion guard test.
2. **Step 2: Hero Presentation Console (`/admin/hero`)**
   - Server Component + HeroConfigForm + Server Actions.
   - Dynamic published initiatives dropdown selector.
3. **Step 3: Studio Principles Console (`/admin/philosophy`)**
   - Server Component + PrinciplesList + PrincipleFormModal + Server Actions.
   - Side-by-side bilingual axiom copy editing.
4. **Step 4: Quality Gate & Verification**
   - `npx tsc --noEmit` $\rightarrow$ 0 errors.
   - `npm run build` $\rightarrow$ Clean build with dynamic routes.
   - Automated regression test suite for all Phase 2C Server Actions.

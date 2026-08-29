# Nalakara Web v1.2 — Phase 2: Admin Content Console Architecture & UX Review

This document establishes the architectural, interaction, and technical specification for building the **Nalakara Content Console (`/admin`)** and its authentication boundary (`/admin/login`).

---

## 1. Current-State Assessment

### Codebase Status
* **Baseline**: Nalakara Web v1.1 Bilingual (`main` branch, commit `c43a26c`).
* **Phase 0 & 1 Complete**:
  * Supabase PostgreSQL foundation initialized with 5 tables (`admin_users`, `categories`, `initiatives`, `studio_principles`, `hero_config`) and 4 ENUMs.
  * Layer 1 object grants and Layer 2 RLS policies active and verified.
  * Canonical v1.1 dataset (4 initiatives, 5 categories, 4 principles, 1 hero config) successfully seeded and verified 1:1 against live database rows.
* **Public Site Status**:
  * Unchanged and completely isolated. Public pages (`/`, components `<Hero />`, `<Initiatives />`, `<Registry />`, `<Philosophy />`) currently consume static TypeScript constants from `src/data/ecosystem.ts` and `src/data/i18n.ts`.

---

## 2. Proposed Route Structure (`/admin`)

The Content Console will be constructed within the Next.js App Router under `src/app/admin/`:

```
src/app/admin/
├── layout.tsx              # Monospace dark editorial shell, global admin navigation, session bar
├── admin.module.css        # Restrained dark theme design tokens & layout rules
├── page.tsx                # Content Overview / Status Dashboard & Quick Actions
├── login/
│   ├── page.tsx            # Minimal passwordless / OTP Magic Link login screen
│   └── actions.ts          # Server action: sendMagicLink, verifyOtp
├── initiatives/
│   ├── page.tsx            # Initiatives list table (sort, filter, draft/published status)
│   ├── new/
│   │   └── page.tsx        # Create initiative form
│   ├── [id]/
│   │   └── page.tsx        # Edit initiative form (side-by-side bilingual fields)
│   └── actions.ts          # Server actions: upsertInitiative, archiveInitiative, deleteInitiative
├── categories/
│   ├── page.tsx            # Taxonomy management list & inline modal/form
│   └── actions.ts          # Server actions: upsertCategory, toggleCategoryActive
├── hero/
│   ├── page.tsx            # Hero mode selector (Studio Manifesto vs. Featured Initiative)
│   └── actions.ts          # Server action: updateHeroConfig
├── philosophy/
│   ├── page.tsx            # Studio Principles editor (01–04 titles & descriptions)
│   └── actions.ts          # Server action: updatePrinciple
└── preview/
    ├── page.tsx            # Authenticated live preview rendering exact public components with draft data
    └── PreviewToolbar.tsx  # Floating sticky bar: Language toggle (EN/ID), viewport info, 'Publish' CTA
```

---

## 3. Information Architecture & UX Guidelines

### Antislop Mode 1 Restrained Dark Theme
* **Visual Tokens**:
  - Background: Pure black / deep charcoal (`#09090b`, `#121214`).
  - Borders: Hairline subtle zinc (`#27272a`, `1px solid`).
  - Typography: Monospace accents (`Geist Mono` / `Courier`) for metadata, status tags, IDs, and timestamps; crisp sans for editorial copy.
  - Zero vanity graphs, zero animated charts, zero generic dashboard cards.

### Core Sections & Capabilities

```
+-----------------------------------------------------------------------------------+
| NALAKARA CONTENT CONSOLE                                   [EN / ID] [Sign Out]   |
+-----------------------------------------------------------------------------------+
| [Overview]  [Initiatives]  [Categories]  [Hero Config]  [Philosophy]  [Live Preview]|
+-----------------------------------------------------------------------------------+
|  INITIATIVES OVERVIEW                                       [ + New Initiative ]  |
|  - B.R.O.S.              [Software]        [Project]   [Published]  [Edit] [Archive]|
|  - Roast Navigator       [Digital System]  [Project]   [Published]  [Edit] [Archive]|
|  - Beauty Batch OS       [Software]        [Project]   [Published]  [Edit] [Archive]|
|  - Nalakara Skill Factory[Experimental]   [Lab]       [Published]  [Edit] [Archive]|
+-----------------------------------------------------------------------------------+
```

1. **Initiatives Editor (`/admin/initiatives/[id]`)**:
   - **System Controls**: Dropdown for `category_id`, `lifecycle_stage` (`idea`, `lab`, `project`, `product`, `commercial`), and `access_model` (`concept`, `private-alpha`, `public-beta`, `production`, `commercial`).
   - **Side-by-Side Bilingual Panes**:
     * Left Column: English (`tagline_en`, `description_en`, `commercial_badge_en`).
     * Right Column: Indonesian (`tagline_id`, `description_id`, `commercial_badge_id`).
   - **Flags**: `featured` (Promote to Current Initiatives section), `is_external`, `target_url`.
   - **State**: `publication_status` (`draft` vs `published` vs `archived`).

2. **Hero Configuration (`/admin/hero`)**:
   - Radio selector: `mode = 'studio'` (Studio Manifesto) vs `mode = 'featured_initiative'`.
   - Initiative selector: Which published initiative is highlighted (only visible if featured mode active).
   - Toggle: `show_lifecycle_bar` (`true` / `false`).
   - *Design Boundary*: Arbitrary manifesto copy editing is intentionally disabled to protect brand typography.

3. **Categories Manager (`/admin/categories`)**:
   - Edit bilingual names (`name_en`, `name_id`), `sort_order`, `is_active`.
   - Foreign-key protection: Attempting to delete a category referenced by initiatives will show a clear inline error.

4. **Studio Principles Editor (`/admin/philosophy`)**:
   - Manage the 4 core axioms with number, bilingual title, and bilingual description.

---

## 4. Authentication Flow & Single-Owner Authorization

```
[ Unauthenticated Request to /admin/* ]
                  │
                  ▼
[ Next.js Middleware (src/middleware.ts) ]
                  │
        ┌─────────┴─────────┐
        │ User logged in?   │
        │ YES               │ NO
        ▼                   ▼
[ Allow /admin route ]   [ Redirect to /admin/login ]
```

### Authorization at Server Action Level:
```typescript
// Enforced in all admin Server Actions:
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  throw new Error("Unauthorized: Session required.");
}

const { data: isAdmin } = await supabase
  .from('admin_users')
  .select('user_id')
  .eq('user_id', user.id)
  .single();

if (!isAdmin) {
  throw new Error("Forbidden: User not authorized in admin allowlist.");
}
```

* **Login Method**: Supabase Auth Magic Link (Email OTP / Link).
* **Zero Password Fatigue**: Fast, secure, passwordless authentication restricted to the verified owner email.

---

## 5. Data Access, Draft/Publish & Cache Revalidation Model

### The Four-State Lifecycle Pipeline:

$$\text{DRAFT (Admin Edits)} \longrightarrow \text{PREVIEW (/admin/preview)} \longrightarrow \text{PUBLISH (Server Action)} \longrightarrow \text{PUBLIC CACHE REVALIDATED}$$

1. **Draft Stage**:
   - When owner clicks "Save Draft", data is written with `publication_status = 'draft'`.
   - Public queries (`publication_status = 'published'`) ignore this row completely.
2. **Preview Stage (`/admin/preview`)**:
   - Server Component queries Supabase including `draft` items.
   - Renders exact public components `<Hero />`, `<Initiatives />`, `<Registry />`, `<Philosophy />` with a floating `<PreviewToolbar />`.
3. **Publish Stage**:
   - Checks bilingual integrity (asserts `name_en`, `name_id`, `tagline_en`, `tagline_id` are non-empty).
   - Updates `publication_status = 'published'` and `published_at = NOW()`.
   - Calls `revalidatePath('/', 'page')` and `revalidateTag('ecosystem-content')`.

---

## 6. Bilingual UX Strategy

* **Editorial Philosophy**: *"One meaning. Two native expressions."*
* **Side-by-Side Interface**: Every text input form is presented with English on the left and Indonesian on the right to facilitate contextual comparison.
* **Validation Gate**: Forms prevent publishing if either language field is blank.

---

## 7. Strict Architectural Boundaries

| Area | Admin Console Can Modify | Admin Console CANNOT Modify |
| :--- | :--- | :--- |
| **Hero** | Mode (`studio` vs `featured`), Featured Initiative ID, Lifecycle Bar toggle | Typography, Manifesto text, Tensor Field physics |
| **Initiatives** | All editorial copy, category, maturity stages, URLs, badges | Card layout CSS, hover micro-interactions |
| **Categories** | Bilingual names, sort order, active status | Core UI grid structure |
| **Philosophy** | Principle numbers, bilingual titles, descriptions | Layout matrix & typography tokens |
| **Design** | *None* | Global CSS variables, fonts, colors, spacing |

---

## 8. Definition of Done (Phase 2)

* [ ] Route `/admin/login` renders clean passwordless login form.
* [ ] Middleware correctly intercepts unauthorized access to `/admin/*`.
* [ ] Shell `/admin/layout.tsx` renders monospace editorial dark interface.
* [ ] Owner can perform CRUD operations on Initiatives, Categories, Hero, and Principles.
* [ ] Draft saves do not affect public static site.
* [ ] `/admin/preview` correctly renders draft data inside public components.
* [ ] All mutations execute via secure Server Actions validating `admin_users` membership.
* [ ] TypeScript (`tsc`) and `npm run build` pass with 0 errors.

---

## Final Verdict

> ### **FINAL VERDICT: ARCHITECTURE REVIEW COMPLETE — READY FOR PHASE 2 IMPLEMENTATION**

# Nalakara Web v1.2 — Phase 2B: Initiatives Management Architecture Review

This document defines the complete technical, operational, and architectural specification for **Phase 2B (Initiatives Management Editor)** of the Nalakara Content Console (`/admin/initiatives`).

---

## 1. Current Initiative Data Model & Schema

### Live PostgreSQL Database Schema (`initiatives` table)
From `supabase/schema.sql`:

| Column | Type | Nullable | Default | Constraints / References |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `VARCHAR(64)` | No | — | `PRIMARY KEY` (slug-formatted identifier) |
| `slug` | `VARCHAR(64)` | No | — | `UNIQUE NOT NULL` |
| `name` | `VARCHAR(64)` | No | — | `NOT NULL` |
| `category_id` | `VARCHAR(32)` | No | — | `REFERENCES categories(id) ON DELETE RESTRICT` |
| `lifecycle_stage` | `lifecycle_stage` (ENUM) | No | `'idea'` | Values: `'idea'`, `'lab'`, `'project'`, `'product'`, `'commercial'` |
| `access_model` | `access_model` (ENUM) | No | `'concept'` | Values: `'concept'`, `'private-alpha'`, `'public-beta'`, `'production'`, `'commercial'` |
| `tagline_en` | `VARCHAR(140)` | No | — | `NOT NULL` |
| `tagline_id` | `VARCHAR(140)` | No | — | `NOT NULL` |
| `description_en` | `VARCHAR(320)` | No | — | `NOT NULL` |
| `description_id` | `VARCHAR(320)` | No | — | `NOT NULL` |
| `target_url` | `VARCHAR(255)` | Yes | `NULL` | Optional URL |
| `is_external` | `BOOLEAN` | No | `true` | `NOT NULL` |
| `featured` | `BOOLEAN` | No | `false` | `NOT NULL` |
| `sort_order` | `INTEGER` | No | `0` | `NOT NULL` |
| `publication_status` | `publication_status` (ENUM) | No | `'draft'` | Values: `'draft'`, `'published'`, `'archived'` |
| `commercial_badge_en` | `VARCHAR(40)` | Yes | `NULL` | Optional badge copy |
| `commercial_badge_id` | `VARCHAR(40)` | Yes | `NULL` | Optional badge copy |
| `commercial_action_en` | `VARCHAR(40)` | Yes | `NULL` | Optional CTA text |
| `commercial_action_id` | `VARCHAR(40)` | Yes | `NULL` | Optional CTA text |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | `NOT NULL` |
| `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | Managed via `trg_initiatives_updated_at` trigger |
| `published_at` | `TIMESTAMPTZ` | Yes | `NULL` | Set timestamp on first publish |

### Related Foreign Keys & Constraints
- **Categories Foreign Key**: `initiatives.category_id` references `categories.id` with `ON DELETE RESTRICT`. A category with assigned initiatives cannot be deleted.
- **Hero Singleton Foreign Key**: `hero_config.featured_initiative_id` references `initiatives.id` with `ON DELETE SET NULL`. If an initiative is deleted, the database automatically sets `featured_initiative_id = NULL`.

---

## 2. Existing TypeScript Types

From `src/types/database.ts`:
- `LifecycleStage`: `'idea' | 'lab' | 'project' | 'product' | 'commercial'`
- `AccessModel`: `'concept' | 'private-alpha' | 'public-beta' | 'production' | 'commercial'`
- `PublicationStatus`: `'draft' | 'published' | 'archived'`
- `Database['public']['Tables']['initiatives']['Row']`
- `Database['public']['Tables']['initiatives']['Insert']`
- `Database['public']['Tables']['initiatives']['Update']`

---

## 3. Existing Admin Shell Integration

- **Route Group**: `src/app/admin/(authenticated)/`
- **Shell Layout**: `src/app/admin/(authenticated)/layout.tsx`
  - Enforces session check (`supabase.auth.getUser()`) and allowlist check (`admin_users` table).
  - Provides sticky monospace navigation bar with active links for Dashboard, Initiatives, Categories, Hero, Philosophy, and Preview.
  - Supports `ADMIN_DEV_BYPASS=true` for local development UI inspection only.
- **Design System**: `src/app/admin/admin.module.css`
  - Dark editorial aesthetic (`#09090b` background, `#121214` surface, `#27272a` hairline borders).
  - Monospace typography for metadata, badges, and controls.

---

## 4. Required Route Structure (Phase 2B)

Target directory structure within `src/app/admin/(authenticated)/initiatives/`:

```
src/app/admin/(authenticated)/initiatives/
├── page.tsx            # Operational Initiatives Registry table
├── new/
│   └── page.tsx        # Create Initiative Form
├── [id]/
│   └── page.tsx        # Existing Initiative Editor (Side-by-side bilingual fields)
└── actions.ts          # Server Actions: saveDraft, publish, create, archive, delete
```

---

## 5. Required Server Actions & Security Boundary

All mutations are defined in `src/app/admin/(authenticated)/initiatives/actions.ts`:

1. **`createInitiativeAction(formData: FormData): Promise<ActionResult>`**
   - Validates input, generates deterministic `id` and `slug`.
   - Defaults: `publication_status = 'draft'`, `featured = false`, `is_external = true`.
   - Inserts row via authenticated client.
   - Revalidates `/admin/initiatives` and returns `{ success: true, id }`.

2. **`updateInitiativeDraftAction(id: string, formData: FormData): Promise<ActionResult>`**
   - Updates editable fields while preserving or explicitly maintaining draft/archived status.
   - Revalidates `/admin/initiatives` and `/admin/initiatives/[id]`.

3. **`publishInitiativeAction(id: string, formData: FormData): Promise<ActionResult>`**
   - Validates full bilingual completeness (no empty strings or whitespace-only values).
   - Updates `publication_status = 'published'` and `published_at = NOW()` (if previously null).
   - Revalidates `/admin/initiatives`, `/admin/initiatives/[id]`, `/admin`, and public paths (`/`).

4. **`archiveInitiativeAction(id: string): Promise<ActionResult>`**
   - Sets `publication_status = 'archived'`.
   - Revalidates `/admin/initiatives`, `/admin/initiatives/[id]`, and public paths.

5. **`deleteInitiativeAction(id: string): Promise<ActionResult>`**
   - Requires explicit confirmation.
   - Deletes record via authenticated client.
   - Handles `ON DELETE RESTRICT` constraint errors gracefully.
   - Revalidates `/admin/initiatives` and redirects to list.

### Authorization Enforcement
Every Server Action must execute the standard owner guard:
```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  return { success: false, error: 'Unauthorized: Valid owner session required.' };
}

const { data: adminUser } = await supabase
  .from('admin_users')
  .select('user_id')
  .eq('user_id', user.id)
  .single();

if (!adminUser) {
  return { success: false, error: 'Forbidden: Account is not in the owner allowlist.' };
}
```
* **No `service_role` client** is used for normal owner mutations; PostgreSQL RLS is preserved.

---

## 6. Validation Boundary & Publishing Safety

### String & Length Constraints
- `name`: 1–64 characters, trimmed.
- `slug`: 1–64 characters, alphanumeric + hyphens (`/^[a-z0-9-]+$/`).
- `category_id`: Must exist in active categories list.
- `lifecycle_stage`: One of `'idea' | 'lab' | 'project' | 'product' | 'commercial'`.
- `access_model`: One of `'concept' | 'private-alpha' | 'public-beta' | 'production' | 'commercial'`.
- `tagline_en` / `tagline_id`: 1–140 characters.
- `description_en` / `description_id`: 1–320 characters.
- `target_url`: Valid URL or empty/null (<= 255 chars).
- `commercial_badge_en` / `commercial_badge_id`: <= 40 characters or null.
- `commercial_action_en` / `commercial_action_id`: <= 40 characters or null.
- `sort_order`: Integer >= 0.

### Draft vs. Publish Gate
- **Save Draft**: Requires valid `name`, `slug`, `category_id`, `lifecycle_stage`, `access_model`. Incomplete bilingual text can be saved as draft so work-in-progress is never lost.
- **Publish**: Enforces strict completeness:
  - `name.trim().length > 0`
  - `tagline_en.trim().length > 0` AND `tagline_id.trim().length > 0`
  - `description_en.trim().length > 0` AND `description_id.trim().length > 0`
  - Valid `category_id`, `lifecycle_stage`, `access_model`
  - If commercial candidate: `commercial_badge_en` and `commercial_badge_id` must be non-empty if one is provided.

---

## 7. Bilingual UX Structure ("One meaning. Two native expressions.")

The editor displays a dual-column side-by-side layout:

```
+-------------------------------------------------------------------------+
| [← Back to Initiatives]                    Status: [ DRAFT ] [Save] [Publish]|
+-------------------------------------------------------------------------+
| SYSTEM METADATA                                                         |
| Name: [________________]   Slug: [________________]  Order: [ 1 ]        |
| Category: [Software  ▼]   Lifecycle: [Project  ▼]    Access: [Alpha   ▼] |
| Target URL: [__________]   [x] External Link         [x] Featured        |
+-------------------------------------------------------------------------+
| BILINGUAL CONTENT (Side-by-Side)                                        |
| ┌─ English (EN) ───────────────┐ ┌─ Bahasa Indonesia (ID) ─────────────┐|
| │ Tagline (max 140):           │ │ Tagline (maks 140):                 │|
| │ [__________________________] │ │ [_________________________________] │|
| │ Description (max 320):       │ │ Deskripsi (maks 320):               │|
| │ [__________________________] │ │ [_________________________________] │|
| │ Commercial Badge (opt 40):   │ │ Badge Komersial (ops 40):           │|
| │ [__________________________] │ │ [_________________________________] │|
| │ Commercial Action (opt 40):  │ │ Aksi Komersial (ops 40):            │|
| │ [__________________________] │ │ [_________________________________] │|
| └──────────────────────────────┘ └─────────────────────────────────────┘|
+-------------------------------------------------------------------------+
| DANGER ZONE                                                             |
| [ Archive Initiative ]                             [ Delete Initiative ]|
+-------------------------------------------------------------------------+
```

---

## 8. Cache Revalidation Strategy

When mutations occur:
1. **Draft Save**: Calls `revalidatePath('/admin/initiatives')`, `revalidatePath('/admin/initiatives/[id]')`, `revalidatePath('/admin')`. Public site cache is **not** touched.
2. **Publish**: Calls `revalidatePath('/admin/initiatives')`, `revalidatePath('/admin/initiatives/[id]')`, `revalidatePath('/admin')`, `revalidatePath('/')`, `revalidateTag('ecosystem')`.
3. **Archive / Delete**: Calls `revalidatePath('/admin/initiatives')`, `revalidatePath('/admin')`, `revalidatePath('/')`, `revalidateTag('ecosystem')`.

---

## 9. Error Handling & Feedback

- Human-readable error alerts rendered inline with specific field highlights.
- Clear distinction between Validation Error, Database Error, Constraint Violation, and Unauthorized Access.
- Destructive deletion requires interactive modal confirmation displaying the target initiative's name.

---

## 10. Verification Plan

1. **TypeScript Check**: `npx tsc --noEmit` (0 errors).
2. **Production Build**: `npm run build` (0 build or prerender errors).
3. **Route Integrity**: Verify `/admin/initiatives`, `/admin/initiatives/new`, `/admin/initiatives/[id]`.
4. **CRUD & Lifecycle Verification**:
   - List display with draft, published, archived filters/rows.
   - Create new initiative in draft status.
   - Edit initiative and save draft.
   - Publish validation rejection on empty fields vs. success on complete fields.
   - Archive and restore / delete behavior.
5. **Security Audit**: Verify service-role key is never leaked and all actions check `admin_users`.

---

## Conclusion & Next Step

The architecture review is complete, internally consistent, and strictly aligned with the live Supabase schema and Phase 2 requirements. Ready for Phase 2B implementation upon confirmation.

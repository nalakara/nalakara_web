# Nalakara Web v1.2 — Phase 0: Database Execution Report

This document records the post-execution inspection of the Supabase PostgreSQL database for **Nalakara Web v1.2** following manual execution in the Supabase SQL Editor.

---

## 1. Execution Status

* **SQL Execution**: Completed manually in the Supabase Dashboard SQL Editor (`Success. No rows returned.`).
* **Source Script**: [`supabase/schema.sql`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/supabase/schema.sql)
* **TypeScript Database Types**: Synchronized in [`src/types/database.ts`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/src/types/database.ts)

---

## 2. Actual Database Objects Verified

### Tables Created
1. `admin_users`: Owner allowlist table referencing `auth.users(id)`.
2. `categories`: Taxonomy table for software, digital systems, physical instruments, services, and experimental labs.
3. `initiatives`: Ecosystem initiatives table with lifecycle stage, access model, publication status, and bilingual copy fields.
4. `studio_principles`: Studio axioms table with bilingual title and description fields.
5. `hero_config`: Presentation mode singleton table.

### Custom PostgreSQL ENUM Types
* `lifecycle_stage`: `'idea'`, `'lab'`, `'project'`, `'product'`, `'commercial'`
* `access_model`: `'concept'`, `'private-alpha'`, `'public-beta'`, `'production'`, `'commercial'`
* `publication_status`: `'draft'`, `'published'`, `'archived'`
* `hero_mode`: `'studio'`, `'featured_initiative'`

---

## 3. Constraints & Foreign Keys

* **Primary Keys**:
  * `admin_users(user_id)`
  * `categories(id)`
  * `initiatives(id)`
  * `studio_principles(id)`
  * `hero_config(id)`
* **Unique Constraints**:
  * `initiatives(slug)`
* **Foreign Keys**:
  * `initiatives.category_id` $\rightarrow$ `categories(id) ON DELETE RESTRICT` (Guarantees no orphaned categories).
  * `hero_config.featured_initiative_id` $\rightarrow$ `initiatives(id) ON DELETE SET NULL` (Prevents broken pointer if an initiative is removed).
  * `admin_users.user_id` $\rightarrow$ `auth.users(id) ON DELETE CASCADE` (Cascades user deletion from Supabase Auth).
* **Singleton Constraint**:
  * `hero_config.hero_singleton_check`: `CHECK (id = 'primary')` (Guarantees exactly one configuration row).

---

## 4. Timestamps & Triggers

* **Trigger Function**: `update_updated_at_column()`
* **Triggers Active**:
  * `trg_categories_updated_at` on `categories`
  * `trg_initiatives_updated_at` on `initiatives`
  * `trg_studio_principles_updated_at` on `studio_principles`
  * `trg_hero_config_updated_at` on `hero_config`

---

## 5. Security & Row-Level Security (RLS) Verification

* **RLS Enabled**: Enabled on all 5 tables (`admin_users`, `categories`, `initiatives`, `studio_principles`, `hero_config`).
* **Public / Anon Read Policy**:
  * `categories`: `is_active = true`
  * `initiatives`: `publication_status = 'published'` (Draft and archived items are completely isolated from public view).
  * `studio_principles`: `publication_status = 'published'`
  * `hero_config`: Restricted so that if a featured initiative is referenced, it must have `publication_status = 'published'`.
* **Owner-Only Management Policy**:
  * Writes (`INSERT`, `UPDATE`, `DELETE`) and draft reads are restricted to users whose `auth.uid()` exists in `admin_users`:
    `EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())`
* **Secret Protection**:
  * No secrets, service-role keys, or database passwords exist in Git history or source files.

---

## 6. Content State (Empty Foundation)

* **Content Tables**: All tables (`categories`, `initiatives`, `studio_principles`, `hero_config`, `admin_users`) are empty.
* **Phase 1 Isolation**: No content migration or seeding has been executed. The public website continues serving from the frozen v1.1 static source.

---

## 7. Discrepancy List

* **Discrepancies Found**: **NONE (0)**.
* The executed schema exactly matches the reviewed and approved [`supabase/schema.sql`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/supabase/schema.sql).

---

## 8. Verification Matrix & Verdict

| Verification Item | Status | Result |
| :--- | :---: | :---: |
| **DATABASE EXECUTION** | Completed in SQL Editor | **PASS** |
| **SCHEMA MATCH** | Exact 1:1 match with `schema.sql` & `database.ts` | **PASS** |
| **RLS SECURITY** | Owner allowlist + Public published isolation | **PASS** |
| **EMPTY FOUNDATION** | Zero premature content rows | **PASS** |
| **TYPESCRIPT & BUILD** | `tsc` (0 errors) & `npm run build` (Static 4/4) | **PASS** |

---

> ### **RECOMMENDATION: READY FOR PHASE 1**

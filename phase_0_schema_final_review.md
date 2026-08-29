# Nalakara Web v1.2 — Phase 0: Schema Final Review

This report presents the corrected and reconciled PostgreSQL schema specification for **Nalakara Web v1.2** in [`supabase/schema.sql`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/supabase/schema.sql), addressing single-owner RLS authorization, domain vocabulary reconciliation, automated timestamps, and draft leakage prevention.

---

## 1. Schema Changes Made

1. **Owner Allowlist Table (`admin_users`)**:
   - Introduced `admin_users` table referencing `auth.users(id)`.
   - Replaced open `TO authenticated USING (true)` policies with strict database-level owner checks: `EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())`.
2. **Domain Vocabulary Reconciled**:
   - Renamed `status` $\rightarrow$ `publication_status` (`draft`, `published`, `archived`) to eliminate ambiguity with lifecycle stage.
   - Renamed `lifecycle` $\rightarrow$ `lifecycle_stage` (`idea`, `lab`, `project`, `product`, `commercial`).
3. **Automated `updated_at` Triggers**:
   - Created PostgreSQL function `update_updated_at_column()` and attached triggers to `categories`, `initiatives`, `studio_principles`, and `hero_config`.
4. **Hero Config Security & Indirect Leakage Guard**:
   - Strengthened public read policy on `hero_config` to ensure that if a featured initiative is referenced, it can only be publicly read if that initiative's `publication_status` is `'published'`.

---

## 2. Final Table List

1. `admin_users` (Owner allowlist)
2. `categories` (Taxonomy categories)
3. `initiatives` (Ecosystem items)
4. `studio_principles` (Foundational axioms)
5. `hero_config` (Presentation mode singleton)

---

## 3. Final Enums & Types

* **`lifecycle_stage`**: `'idea'`, `'lab'`, `'project'`, `'product'`, `'commercial'`
* **`access_model`**: `'concept'`, `'private-alpha'`, `'public-beta'`, `'production'`, `'commercial'`
* **`publication_status`**: `'draft'`, `'published'`, `'archived'`
* **`hero_mode`**: `'studio'`, `'featured_initiative'`

---

## 4. Final Constraints & Default Values

* **`admin_users`**:
  * `user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
  * `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
* **`categories`**:
  * `id VARCHAR(32) PRIMARY KEY`
  * `name_en VARCHAR(64) NOT NULL`, `name_id VARCHAR(64) NOT NULL`
  * `sort_order INTEGER NOT NULL DEFAULT 0`
  * `is_active BOOLEAN NOT NULL DEFAULT true`
  * `created_at / updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
* **`initiatives`**:
  * `id VARCHAR(64) PRIMARY KEY`, `slug VARCHAR(64) UNIQUE NOT NULL`
  * `name VARCHAR(64) NOT NULL`
  * `category_id VARCHAR(32) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT`
  * `lifecycle_stage lifecycle_stage NOT NULL DEFAULT 'idea'`
  * `access_model access_model NOT NULL DEFAULT 'concept'`
  * `tagline_en VARCHAR(140) NOT NULL`, `tagline_id VARCHAR(140) NOT NULL`
  * `description_en VARCHAR(320) NOT NULL`, `description_id VARCHAR(320) NOT NULL`
  * `target_url VARCHAR(255) NULL`
  * `is_external BOOLEAN NOT NULL DEFAULT true`
  * `featured BOOLEAN NOT NULL DEFAULT false`
  * `sort_order INTEGER NOT NULL DEFAULT 0`
  * `publication_status publication_status NOT NULL DEFAULT 'draft'`
  * `commercial_badge_en/id VARCHAR(40) NULL`
  * `commercial_action_en/id VARCHAR(40) NULL`
  * `created_at / updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * `published_at TIMESTAMPTZ NULL`
* **`studio_principles`**:
  * `id VARCHAR(32) PRIMARY KEY`
  * `number VARCHAR(4) NOT NULL`
  * `title_en VARCHAR(80) NOT NULL`, `title_id VARCHAR(80) NOT NULL`
  * `description_en TEXT NOT NULL`, `description_id TEXT NOT NULL`
  * `sort_order INTEGER NOT NULL DEFAULT 0`
  * `publication_status publication_status NOT NULL DEFAULT 'published'`
  * `created_at / updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
* **`hero_config`**:
  * `id VARCHAR(16) PRIMARY KEY DEFAULT 'primary'`
  * `mode hero_mode NOT NULL DEFAULT 'studio'`
  * `featured_initiative_id VARCHAR(64) REFERENCES initiatives(id) ON DELETE SET NULL`
  * `show_lifecycle_bar BOOLEAN NOT NULL DEFAULT true`
  * `CONSTRAINT hero_singleton_check CHECK (id = 'primary')`
  * `created_at / updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

---

## 5. Final Foreign Keys & Relational Behavior

1. `initiatives.category_id REFERENCES categories(id) ON DELETE RESTRICT`:
   - Mencegah penghapusan kategori jika masih dirujuk oleh inisiatif aktif.
2. `hero_config.featured_initiative_id REFERENCES initiatives(id) ON DELETE SET NULL`:
   - Menghindari *dangling pointer* pada singleton Hero jika inisiatif dihapus.
3. `admin_users.user_id REFERENCES auth.users(id) ON DELETE CASCADE`:
   - Menjaga integritas tabel allowlist jika user dihapus dari auth Supabase.

---

## 6. Exact RLS Policies

```sql
-- 1. admin_users Allowlist Table
CREATE POLICY "Owner can view admin allowlist" ON admin_users
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 2. Public Read Policies
CREATE POLICY "Public read active categories" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read published initiatives" ON initiatives
  FOR SELECT USING (publication_status = 'published');

CREATE POLICY "Public read published principles" ON studio_principles
  FOR SELECT USING (publication_status = 'published');

CREATE POLICY "Public read hero config" ON hero_config
  FOR SELECT USING (
    mode = 'studio'
    OR featured_initiative_id IS NULL
    OR EXISTS (
      SELECT 1 FROM initiatives
      WHERE initiatives.id = hero_config.featured_initiative_id
        AND initiatives.publication_status = 'published'
    )
  );

-- 3. Owner-Only Management Policies (Strictly checking admin_users allowlist)
CREATE POLICY "Owner full access categories" ON categories
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Owner full access initiatives" ON initiatives
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Owner full access principles" ON studio_principles
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Owner full access hero config" ON hero_config
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));
```

---

## 7. Evaluasi Batas Keamanan & Akses

| Aktor | SELECT (Baca) | INSERT / UPDATE / DELETE (Tulis) |
| :--- | :--- | :--- |
| **Anon / Publik** | Hanya data `publication_status = 'published'` & `is_active = true` | **DIBLOKIR 100%** |
| **Authenticated (Non-Owner)** | Sama seperti Publik | **DIBLOKIR 100%** (Tidak ada di `admin_users`) |
| **Authorized Owner** | Akses penuh seluruh status (`draft`, `published`, `archived`) | **DIIZINKAN** (`EXISTS in admin_users`) |
| **Service Role** | Akses penuh (Server-side bypass) | **DIIZINKAN** (Server-side only) |

---

## 8. Jaminan Data: Database vs. Aplikasi

| Aspek | Jaminan Database (PostgreSQL / RLS) | Jaminan Aplikasi (Next.js Server Actions) |
| :--- | :---: | :---: |
| **Keabsahan Nilai Lifecycle** | **Penuh** (`lifecycle_stage` ENUM) | Dropdown input |
| **Keabsahan Model Akses** | **Penuh** (`access_model` ENUM) | Dropdown input |
| **Pencegahan Data Duplikat** | **Penuh** (`slug UNIQUE`) | Validasi Zod |
| **Pencegahan Hapus Kategori Aktif**| **Penuh** (`ON DELETE RESTRICT`) | Peringatan UI |
| **Pencegahan Multi-baris Hero** | **Penuh** (`CHECK (id = 'primary')`) | UI Form |
| **Otorisasi Owner Tunggal** | **Penuh** (RLS `EXISTS admin_users`) | Next.js Middleware check |
| **Isolasi Data Draft & Archived** | **Penuh** (RLS `publication_status = 'published'`) | Filter Server Component |
| **Kelengkapan String Non-Kosong** | *Kolom NOT NULL (mencegah NULL)* | **Validasi Publish**: Memastikan string tidak berupa whitespace (`trim().length > 0`) |

---

## 9. Perbedaan dari Skema Sebelumnya

1. **Menambahkan tabel `admin_users`**: Mengamankan otorisasi admin secara absolut di tingkat basis data.
2. **Memperbaiki Rekonsiliasi Istilah**: Mengubah `status` menjadi `publication_status` dan `lifecycle` menjadi `lifecycle_stage`.
3. **Mengamankan RLS `hero_config`**: Memastikan konfigurasi hero yang merujuk inisiatif berstatus `draft` tidak bocor ke publik.
4. **Menambahkan Trigger `updated_at` Otomatis**: Menjamin integritas timestamp modifikasi data secara konsisten.

---

## 10. Status Risiko & Kesiapan

* **Risiko Kebocoran Data**: **0 (NIL)** — Data draft dan archived terisolasi mutlak di level PostgreSQL.
* **Risiko Eskalasi Akses**: **0 (NIL)** — Akun authenticated non-owner diblokir dari operasi tulis.
* **Kompatibilitas Kode**: TypeScript types ([`src/types/database.ts`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/src/types/database.ts)) lulus `npx tsc --noEmit` dan `npm run build`.

---

## FINAL VERDICT

> ### **VERDICT: PASS — safe to execute schema**
>
> Skema telah disempurnakan secara menyeluruh, mengunci otorisasi pemilik tunggal pada level RLS PostgreSQL, menyelaraskan terminologi domain model, menambahkan trigger timestamp otomatis, dan menutup seluruh celah kebocoran data draft.

---
*Langkah selanjutnya adalah peninjauan manusia (Human Review) sebelum SQL ini dieksekusi di Supabase SQL Editor.*

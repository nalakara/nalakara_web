# Nalakara Web v1.2 — Phase 1: Data Migration Review

This document provides a comprehensive, deterministic design and verification specification for migrating the frozen **Nalakara Web v1.1** editorial content into the Supabase database.

---

## 1. Source Inventory

An exhaustive inspection of `src/data/ecosystem.ts`, `src/data/i18n.ts`, and `src/types/index.ts` identifies the following canonical entities:

### 1.1 Initiatives (4 Records)
1. **`bros`**:
   - `name`: `"B.R.O.S."`
   - `tagline.en`: `"Autonomous operations and system intelligence framework."`
   - `tagline.id`: `"Kerangka kerja operasi mandiri dan kecerdasan sistem."`
   - `description.en`: `"An operational backbone engineered for managing autonomous workflows, structured execution, and multi-agent coordination."`
   - `description.id`: `"Fondasi operasional yang dirancang untuk mengelola alur kerja mandiri, eksekusi terstruktur, dan koordinasi multi-agen."`
   - `status`: `'project'` (Maps to `lifecycle_stage = 'project'`)
   - `category`: `'software'`
   - `accessModel`: `'private-alpha'`
   - `targetUrl`: `undefined`
   - `isExternal`: `false`
   - `featured`: `true`
   - `order`: `1`
   - `commercial`: `undefined`
2. **`roast-navigator`**:
   - `name`: `"Roast Navigator"`
   - `tagline.en`: `"Sensory and roast curve tracking platform for specialty coffee."`
   - `tagline.id`: `"Platform pelacakan kurva sangrai dan evaluasi sensorik kopi spesialti."`
   - `description.en`: `"A specialized digital system designed to evaluate roast kinetics, thermal trajectories, and sensory profiles."`
   - `description.id`: `"Sistem digital khusus untuk mengevaluasi kinetika sangrai, trajektori termal, dan profil sensorik rasa."`
   - `status`: `'project'`
   - `category`: `'digital-system'`
   - `accessModel`: `'private-alpha'`
   - `targetUrl`: `undefined`
   - `isExternal`: `false`
   - `featured`: `true`
   - `order`: `2`
   - `commercial`: `undefined`
3. **`beauty-batch-os`**:
   - `name`: `"Beauty Batch OS"`
   - `tagline.en`: `"Formulation, compliance, and batch management system."`
   - `tagline.id`: `"Sistem manajemen formulasi, kepatuhan, dan produksi batch kosmetik."`
   - `description.en`: `"An operating framework engineered for cosmetic formulation labs to manage recipes, batch records, and ingredient inventory."`
   - `description.id`: `"Kerangka kerja operasional untuk laboratorium kosmetik dalam mengelola formula, catatan batch, dan inventaris bahan baku."`
   - `status`: `'project'`
   - `category`: `'software'`
   - `accessModel`: `'private-alpha'`
   - `targetUrl`: `undefined`
   - `isExternal`: `false`
   - `featured`: `true`
   - `order`: `3`
   - `commercial`: `{ pricingType: 'custom', badgeLabel: { en: 'Commercial Candidate', id: 'Kandidat Komersial' } }`
4. **`skill-factory`**:
   - `name`: `"Nalakara Skill Factory"`
   - `tagline.en`: `"Modular agent skill synthesis and capability training pipeline."`
   - `tagline.id`: `"Alur sintesis kemampuan dan pelatihan keterampilan agen AI modular."`
   - `description.en`: `"A systematic lab environment for creating, benchmarking, and distributing specialized agent capabilities and domain toolkits."`
   - `description.id`: `"Lingkungan riset sistematis untuk merancang, menguji tolok ukur, dan mendistribusikan keahlian agen AI serta toolkit khusus."`
   - `status`: `'lab'`
   - `category`: `'experimental'`
   - `accessModel`: `'private-alpha'`
   - `targetUrl`: `undefined`
   - `isExternal`: `false`
   - `featured`: `false`
   - `order`: `4`
   - `commercial`: `undefined`

### 1.2 Categories (5 Distinct Categories in Taxonomy, 3 Active in Initiatives)
From `src/types/index.ts` and `src/data/i18n.ts`:
1. `software`: `"Software"` / `"Perangkat Lunak"`, `sort_order: 1`, `is_active: true`
2. `digital-system`: `"Digital System"` / `"Sistem Digital"`, `sort_order: 2`, `is_active: true`
3. `physical-good`: `"Physical Instrument"` / `"Produk Fisik"`, `sort_order: 3`, `is_active: true`
4. `service`: `"Studio Service"` / `"Layanan"`, `sort_order: 4`, `is_active: true`
5. `experimental`: `"Experimental Lab"` / `"Eksperimental"`, `sort_order: 5`, `is_active: true`

### 1.3 Studio Principles (4 Records)
1. **`01`**:
   - `title.en`: `"Domain Independence"`
   - `title.id`: `"Independensi Lintas Ranah"`
   - `description.en`: `"Ideas are not restricted to a single industrial or technological vertical. We apply systemic thinking across digital software, physical instruments, and operational frameworks."`
   - `description.id`: `"Gagasan tidak dibatasi oleh satu bidang industri atau teknologi tertentu. Kami menerapkan pola pikir sistemik pada perangkat lunak digital, instrumen fisik, dan kerangka kerja operasional."`
   - `sort_order`: `1`
2. **`02`**:
   - `title.en`: `"Utility Over Novelty"`
   - `title.id`: `"Fungsi di Atas Kebaruan Semu"`
   - `description.en`: `"We do not build purely decorative demonstrations. Every artifact originating from the foundry must perform real, verifiable work and solve concrete problems."`
   - `description.id`: `"Kami tidak membuat karya yang sekadar demonstrasi dekoratif. Setiap karya yang lahir dari studio harus berfungsi nyata, teruji, dan memecahkan masalah konkret."`
   - `sort_order`: `2`
3. **`03`**:
   - `title.en`: `"Autonomous Product Identity"`
   - `title.id`: `"Identitas Produk yang Mandiri"`
   - `description.en`: `"Individual initiatives earn their own dedicated visual identities, distinct subdomains, and tailored user experiences rather than being forced into a uniform corporate template."`
   - `description.id`: `"Setiap inisiatif memiliki identitas visual tersendiri, subdomain khusus, dan pengalaman pengguna yang disesuaikan—bukan dipaksakan ke dalam template korporat yang seragam."`
   - `sort_order`: `3`
4. **`04`**:
   - `title.en`: `"Disciplined Lifecycle Evolution"`
   - `title.id`: `"Evolusi Siklus Hidup yang Disiplin"`
   - `description.en`: `"Initiatives graduate deliberately through five verifiable states: Idea → Lab → Project → Product → Commercial. Progression requires stability, utility, and real-world validation."`
   - `description.id`: `"Inisiatif bertumbuh secara bertahap melalui lima fase terukur: Gagasan → Lab → Proyek → Produk → Komersial. Setiap kemajuan membutuhkan stabilitas, kegunaan, dan validasi nyata."`
   - `sort_order`: `4`

### 1.4 Hero Configuration (Singleton)
* `mode`: `'studio'`
* `featured_initiative_id`: `null`
* `show_lifecycle_bar`: `true`

---

## 2. Exact Source $\rightarrow$ Database Field Mapping

### Table: `categories`
| Source Field (`src/data/i18n.ts` / `src/types/index.ts`) | Destination Field (`categories`) | Transformation | Reason |
| :--- | :--- | :--- | :--- |
| `InitiativeCategory` key (`'software'`, etc.) | `id` | None | Natural unique identifier. |
| `itemCard.categories[key]` (EN) | `name_en` | Title-case normalized (`'Software'`) | Editorial display label. |
| `itemCard.categories[key]` (ID) | `name_id` | Title-case normalized (`'Perangkat Lunak'`) | Editorial Indonesian label. |
| Array index + 1 | `sort_order` | Integer index | Deterministic taxonomy ordering. |
| Constant `true` | `is_active` | None | Default active state. |

### Table: `initiatives`
| Source Field (`EcosystemItem` in `src/data/ecosystem.ts`) | Destination Field (`initiatives`) | Transformation | Reason |
| :--- | :--- | :--- | :--- |
| `item.id` | `id` | None | Immutable primary key (`'bros'`, etc.). |
| `item.id` | `slug` | None | URL-safe slug identity. |
| `item.name` | `name` | None | Display title. |
| `item.category` | `category_id` | Foreign Key lookup | Relational link to `categories(id)`. |
| `item.status` | `lifecycle_stage` | Enum value match | `'idea' \| 'lab' \| 'project' \| 'product' \| 'commercial'`. |
| `item.accessModel` | `access_model` | Enum value match | `'concept' \| 'private-alpha' \| 'public-beta' \| 'production' \| 'commercial'`. |
| `item.tagline.en` | `tagline_en` | None | Direct English copy mapping. |
| `item.tagline.id` | `tagline_id` | None | Direct Indonesian copy mapping. |
| `item.description.en` | `description_en` | None | Direct English copy mapping. |
| `item.description.id` | `description_id` | None | Direct Indonesian copy mapping. |
| `item.targetUrl` | `target_url` | `targetUrl ?? null` | Nullable external destination. |
| `item.isExternal` | `is_external` | None | New tab behavior. |
| `item.featured` | `featured` | None | Promoted to Current Initiatives. |
| `item.order` | `sort_order` | None | Canonical display ordering. |
| Derived rule: All v1.1 public items | `publication_status` | `'published'` | Preserves current public visibility. |
| `item.commercial?.badgeLabel?.en` | `commercial_badge_en` | `badgeLabel?.en ?? null` | Optional badge override. |
| `item.commercial?.badgeLabel?.id` | `commercial_badge_id` | `badgeLabel?.id ?? null` | Optional badge override. |
| `item.commercial?.actionLabel?.en` | `commercial_action_en` | `actionLabel?.en ?? null` | Optional CTA override. |
| `item.commercial?.actionLabel?.id` | `commercial_action_id` | `actionLabel?.id ?? null` | Optional CTA override. |

### Table: `studio_principles`
| Source Field (`StudioPrinciple` in `src/data/ecosystem.ts`) | Destination Field (`studio_principles`) | Transformation | Reason |
| :--- | :--- | :--- | :--- |
| `'principle-' + item.number` | `id` | Deterministic prefix + number (`'principle-01'`) | Stable primary key. |
| `item.number` | `number` | None | Formatted number (`'01'`, etc.). |
| `item.title.en` | `title_en` | None | Direct English title mapping. |
| `item.title.id` | `title_id` | None | Direct Indonesian title mapping. |
| `item.description.en` | `description_en` | None | Direct English description mapping. |
| `item.description.id` | `description_id` | None | Direct Indonesian description mapping. |
| `parseInt(item.number, 10)` | `sort_order` | Numeric cast | Deterministic ordering. |
| Derived rule | `publication_status` | `'published'` | Preserves current public visibility. |

### Table: `hero_config`
| Source Field (v1.1 public baseline) | Destination Field (`hero_config`) | Transformation | Reason |
| :--- | :--- | :--- | :--- |
| `'primary'` | `id` | Fixed singleton key | Enforces single-row constraint. |
| `'studio'` | `mode` | Hardcoded default | Preserves Studio Manifesto Hero. |
| `null` | `featured_initiative_id` | None | No featured project override in v1.1. |
| `true` | `show_lifecycle_bar` | None | Preserves 5-stage progress indicator. |

---

## 3. Identifier Strategy

* **Categories**: Natural string IDs matching `InitiativeCategory` type: `'software'`, `'digital-system'`, `'physical-good'`, `'service'`, `'experimental'`.
* **Initiatives**: Natural string IDs matching `item.id` in `ecosystem.ts`: `'bros'`, `'roast-navigator'`, `'beauty-batch-os'`, `'skill-factory'`.
* **Studio Principles**: Deterministic string IDs: `'principle-01'`, `'principle-02'`, `'principle-03'`, `'principle-04'`.
* **Hero Config**: Immutable singleton ID `'primary'`.

*Zero random UUID generation.* Running the migration repeatedly produces identical primary keys.

---

## 4. Category Mapping Table

| ID | Name (EN) | Name (ID) | Sort Order | Active | Referenced By |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `software` | Software | Perangkat Lunak | 1 | `true` | `bros`, `beauty-batch-os` |
| `digital-system` | Digital System | Sistem Digital | 2 | `true` | `roast-navigator` |
| `physical-good` | Physical Instrument | Produk Fisik | 3 | `true` | *(None in v1.1)* |
| `service` | Studio Service | Layanan | 4 | `true` | *(None in v1.1)* |
| `experimental` | Experimental Lab | Eksperimental | 5 | `true` | `skill-factory` |

---

## 5. Initiative Mapping Table

| ID / Slug | Name | Category | Lifecycle Stage | Access Model | Featured | Sort Order | Status | Commercial Badge (EN/ID) |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| `bros` | B.R.O.S. | `software` | `project` | `private-alpha` | `true` | 1 | `published` | *None* |
| `roast-navigator` | Roast Navigator | `digital-system` | `project` | `private-alpha` | `true` | 2 | `published` | *None* |
| `beauty-batch-os` | Beauty Batch OS | `software` | `project` | `private-alpha` | `true` | 3 | `published` | Commercial Candidate / Kandidat Komersial |
| `skill-factory` | Nalakara Skill Factory | `experimental` | `lab` | `private-alpha` | `false` | 4 | `published` | *None* |

---

## 6. Publication Status Mapping & Rationale

* **Rule**: All 4 initiatives in `src/data/ecosystem.ts` are currently rendered on the public website `nalakara.com`. Therefore, they must receive `publication_status = 'published'`.
* **Verification**: Setting them to `draft` would hide them on the public site once the data source is switched. Setting them to `published` preserves exact v1.1 public parity.

---

## 7. Hero Configuration State

```json
{
  "id": "primary",
  "mode": "studio",
  "featured_initiative_id": null,
  "show_lifecycle_bar": true
}
```

---

## 8. Studio Principles Mapping Table

| ID | Number | Title (EN) | Title (ID) | Sort Order | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `principle-01` | `01` | Domain Independence | Independensi Lintas Ranah | 1 | `published` |
| `principle-02` | `02` | Utility Over Novelty | Fungsi di Atas Kebaruan Semu | 2 | `published` |
| `principle-03` | `03` | Autonomous Product Identity | Identitas Produk yang Mandiri | 3 | `published` |
| `principle-04` | `04` | Disciplined Lifecycle Evolution | Evolusi Siklus Hidup yang Disiplin | 4 | `published` |

---

## 9. Bilingual Integrity Rules

* **Rule 1 (Zero Translation Alteration)**: The migration script maps existing `tagline.en/id`, `description.en/id`, and `title.en/id` strictly without modifying punctuation or phrasing.
* **Rule 2 (Pre-Insert Validation)**: The script validates that every text field is non-null, non-empty, and has `trim().length > 0`. If any string is empty, migration halts immediately.

---

## 10. 1:1 Verification Strategy

A dedicated verification module (`scripts/verify-migration.ts`) will perform an automated comparison between static TypeScript data and Supabase query results:

1. **Category Count & Fields**: Assert 5 categories exist with exact bilingual names and order.
2. **Initiative Count & Fields**: Assert 4 initiatives exist with exact lifecycle stage, access model, featured flag, order, and bilingual text.
3. **Principles Count & Fields**: Assert 4 principles exist with exact titles and descriptions.
4. **Hero Singleton**: Assert 1 hero record exists with `mode = 'studio'`.
5. **Output**: Produces a clean markdown table showing field-by-field equality and a final `PASS / FAIL` verdict.

---

## 11. Idempotency Strategy

* All database inserts use `UPSERT` (`INSERT ... ON CONFLICT (id) DO UPDATE ...`).
* Re-running the migration script will update existing records in place without creating duplicate rows or changing foreign key relationships.

---

## 12. Transaction & Rollback Strategy

* The migration script executes sequentially in topological dependency order:
  1. `categories` (referenced by initiatives)
  2. `initiatives` (references categories, referenced by hero)
  3. `studio_principles` (standalone)
  4. `hero_config` (references initiatives)
* If any step fails, the script reports the error and aborts. Because the public site in Phase 1 still reads from local files, database errors have zero impact on the live website.

---

## 13. Fallback Preservation

* `src/data/ecosystem.ts` and `src/data/i18n.ts` remain completely untouched throughout Phase 1.
* The public application does NOT switch to database queries in Phase 1.

---

## 14. Security Requirements

* The future migration script runs in a server environment and requires `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for administrative seeding.
* The service-role key is provided via local `.env.local` (ignored by Git) and is **never** committed or printed to console logs.

---

## 15. Migration Script Structure (`scripts/seed-supabase.ts`)

```typescript
// Proposed structure (Read-Only Design):
import { createAdminClient } from '@/lib/supabase/server';
import { ECOSYSTEM_INITIATIVES, STUDIO_PRINCIPLES } from '@/data/ecosystem';

export async function runMigration() {
  // 1. Validate environment
  // 2. Validate source data completeness
  // 3. Upsert Categories (5)
  // 4. Upsert Initiatives (4)
  // 5. Upsert Studio Principles (4)
  // 6. Upsert Hero Config (1)
  // 7. Run Verification Comparator
  // 8. Output Migration Report
}
```

---

## 16. Risks & Discrepancies

* **Discrepancies Found**: **NONE (0)**.
* **Maturity / Factual Claims**: All 4 initiatives correctly carry `private-alpha` and `project`/`lab` statuses, perfectly matching the approved antislop and content audits.

---

## 17. Definition of Done (Phase 1)

* [ ] `scripts/seed-supabase.ts` created and validated.
* [ ] All 5 categories, 4 initiatives, 4 principles, and 1 hero config seeded into Supabase.
* [ ] `scripts/verify-migration.ts` reports 100% property-by-property equality.
* [ ] Database contains zero orphaned records.
* [ ] Public site remains 100% stable on v1.1 static baseline.

---

## Explicit Quality Gate Verdicts

| Gate | Assessment | Result |
| :--- | :--- | :---: |
| **SOURCE INVENTORY** | 4 initiatives, 5 categories, 4 principles, 1 hero config fully indexed | **PASS** |
| **SCHEMA MAPPING** | 100% compatible with `supabase/schema.sql` and `database.ts` | **PASS** |
| **CONTENT PRESERVATION** | Zero rewriting, zero loss of factual/editorial content | **PASS** |
| **BILINGUAL INTEGRITY** | Strict EN/ID pairing with non-empty assertions | **PASS** |
| **DETERMINISM** | Natural IDs prevent random drift | **PASS** |
| **IDEMPOTENCY** | Upsert-based keys guarantee safe re-runs | **PASS** |
| **ROLLBACK SAFETY** | Public site unaffected; local TypeScript fallback preserved | **PASS** |

---

> ### **FINAL VERDICT: READY FOR PHASE 1 EXECUTION**

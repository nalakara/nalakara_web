# Nalakara Web v1.2 — Phase 2C Business Review: Taxonomy & Studio Configuration

**Document Status**: Proposal & Discovery Baseline  
**Phase**: Phase 2C  
**Author**: Antigravity  
**Target Milestone**: Content Console v1.2  

---

## 1. Business Purpose & Executive Overview

Nalakara is an autonomous product venture studio. Its public web presence communicates two intertwined dimensions:
1. **The Product Ecosystem** (Initiatives & Taxonomies): What the studio builds, operates, and commercializes.
2. **The Studio Identity & Axioms** (Hero Presentation & Studio Principles): Why the studio exists, how it operates, and the governing philosophies that drive its work.

In **Phase 2B**, we successfully delivered the **Initiatives Management Editor**, enabling full lifecycle governance over initiatives in Supabase PostgreSQL. However, the Content Console currently lacks operational control over the remaining content domains:
- **Taxonomies (`Categories`)**: The classification system required to categorize current and future initiatives.
- **Hero Presentation Mode (`Hero Config`)**: The switchboard governing whether the homepage presents the studio manifesto or spotlights a marquee initiative.
- **Studio Principles (`Philosophy`)**: The 4 foundational axioms articulating Nalakara's craft and operational discipline.

**Phase 2C** completes the administration layer of the Content Console by operationalizing **Categories, Hero Configuration, and Studio Principles**, bringing 100% of the studio's textual and relational content under single-owner administrative control.

---

## 2. User & Operator Need

As the sole studio owner/operator, the user requires:
1. **Taxonomy Autonomy**: Ability to define new product categories (e.g., *Creative Tools*, *Autonomous Systems*, *Physical Goods*), update bilingual category labels, reorder classification tabs, and retire obsolete categories without editing code or database tables manually.
2. **Hero Presentation Governance**: Ability to toggle the homepage Hero section between **Studio Manifesto Mode** (broad institutional introduction) and **Featured Initiative Mode** (spotlighting a specific live initiative like *B.R.O.S.* or *Beauty Batch OS*) with a single click.
3. **Principles Refinement**: Ability to refine the copy, bilingual translations, and sequencing of the studio’s 4 core principles (*Domain Independence*, *Utility Over Novelty*, *Autonomous Product Identity*, *Disciplined Lifecycle Evolution*).
4. **Editorial Parity**: All new editors must respect Nalakara's strict editorial equity: English (`EN`) and Bahasa Indonesia (`ID`) presented side-by-side as native expressions, not secondary translations.

---

## 3. Scope of Operational Domains

Phase 2C encompasses three distinct administrative sub-domains:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CONTENT CONSOLE — PHASE 2C                          │
├──────────────────────────┬─────────────────────────┬────────────────────┤
│   1. CATEGORIES          │   2. HERO CONFIG        │   3. PHILOSOPHY    │
│   (/admin/categories)    │   (/admin/hero)         │   (/admin/philosophy)
├──────────────────────────┼─────────────────────────┼────────────────────┤
│ • Taxonomy Definitions   │ • Mode: Studio vs       │ • 4 Core Axioms    │
│ • Bilingual Names        │   Featured Initiative   │ • Bilingual Titles │
│ • Active/Inactive State  │ • Featured Item Select  │ • Axiom Copy       │
│ • Display Order          │ • Lifecycle Bar Toggle  │ • Display Sequence │
└──────────────────────────┴─────────────────────────┴────────────────────┘
```

---

## 4. Expected Operator Workflows

### A. Category Management Workflow (`/admin/categories`)
1. **View Registry**: Operator views all existing categories with initiative count chips (e.g. `Software (2)`, `Digital System (1)`), sort orders, and active toggles.
2. **Create Category**: Operator inputs immutable slug ID (`ai-system`), English name (`Artificial Intelligence System`), and Indonesian name (`Sistem Kecerdasan Buatan`).
3. **Edit / Reorder**: Operator updates bilingual labels or alters sort orders.
4. **Deactivate / Delete Guard**:
   - An active category can be toggled to inactive (`is_active = false`).
   - If an operator attempts to delete a category that has attached initiatives, the UI and database block the deletion and display a descriptive warning: *"Cannot delete category: 2 initiatives are assigned to this category. Reassign them first."*

### B. Hero Configuration Workflow (`/admin/hero`)
1. **View Configuration**: Operator inspects current singleton configuration (`mode = 'studio'`).
2. **Mode Toggle**:
   - Operator selects **Studio Mode** $\rightarrow$ Homepage hero presents canonical manifesto and tagline.
   - Operator selects **Featured Initiative Mode** $\rightarrow$ UI reveals a selector populated with published initiatives from the registry. Operator selects an initiative (e.g., `B.R.O.S.`).
3. **Lifecycle Bar Toggle**: Operator toggles whether the visual 5-stage lifecycle indicator (`Idea → Lab → Project → Product → Commercial`) renders below the hero copy.
4. **Save Configuration**: Operator saves changes; instant validation ensures a featured initiative is selected when in featured mode.

### C. Studio Principles Workflow (`/admin/philosophy`)
1. **View Principles Matrix**: Operator views the ordered list of axioms (`01` through `04`) with bilingual preview.
2. **Edit Axiom**: Operator opens an axiom modal/editor to update the title (`title_en`, `title_id`) and multi-paragraph description (`description_en`, `description_id`).
3. **Reorder Axioms**: Operator adjusts sequencing numbers/sort orders.
4. **Save Draft / Publish**: Updates persist to database in accordance with standard publication status.

---

## 5. Required vs. Optional Content Policy

In alignment with the refined Phase 2B publication model, Phase 2C enforces strict field segregation:

| Domain | Required Fields (Cannot Publish Without) | Optional Fields |
| :--- | :--- | :--- |
| **Categories** | `id` (slug), `name_en`, `name_id` | `sort_order` (defaults to 0), `is_active` (defaults to true) |
| **Hero Config** | `mode` (`'studio' \| 'featured_initiative'`), `featured_initiative_id` (Required IF mode is `featured_initiative`) | `show_lifecycle_bar` (defaults to true) |
| **Principles** | `number`, `title_en`, `title_id`, `description_en`, `description_id` | `sort_order` (defaults to 0), `publication_status` (defaults to `published`) |

---

## 6. Relationship to Initiatives Editor & Public Website

* **Initiatives Dependency**: The `/admin/initiatives/new` and `/admin/initiatives/[id]` forms dynamically fetch their category dropdown options from the `categories` table. Operationalizing `/admin/categories` ensures newly created categories immediately appear in the initiative editor without deployment.
* **Hero Dependency**: The `/admin/hero` editor queries published initiatives from the `initiatives` table, establishing seamless relational integrity.
* **Public Website Invariant**: The public website (`nalakara.com` / `src/app/page.tsx`) **STILL reads static constants** (`src/data/ecosystem.ts`, `src/data/i18n.ts`) during Phase 2C. Modifying categories, hero, or principles in the admin console will update Supabase PostgreSQL, but will NOT alter public rendering until **Phase 5 (Public Source Migration & Cutover)**.

---

## 7. Product Question: Initiative Visual vs. Dedicated Media Phase

### Explicit Evaluation:
An initiative in the Nalakara ecosystem may eventually require a rich visual representation (e.g. an interface screenshot, product render, architectural diagram, or representative identity visual).

**Strategic Recommendation**:
* **Do NOT force image uploads or media storage into Phase 2C.**
* Phase 2C's scope is strictly **Textual Taxonomy & Studio Configuration**.
* Introducing file uploads, Supabase Storage buckets, image optimization, responsive `srcset`, and focal points prematurely in Phase 2C would violate the single-responsibility principle and create technical debt.
* **Correct Approach**: In Phase 2C's architecture review, we document the explicit schema/type attachment point (`visual_url`, `visual_alt_en`, `visual_alt_id`, `visual_type`) for a dedicated future **Media & Asset Management Phase**.

---

## 8. What Phase 2C Explicitly Does NOT Solve

* ❌ **Public Frontend Cutover**: Does not switch public `/` to fetch from Supabase (deferred to Phase 5).
* ❌ **Live Preview Rendering**: Does not build `/admin/preview` (scheduled for Phase 3).
* ❌ **Binary Asset / Image Storage**: Does not create S3/Supabase storage buckets or upload widgets.
* ❌ **Arbitrary Custom Hero Copy**: Does not permit arbitrary headline text in Hero that deviates from approved studio brand copy.
* ❌ **Multi-User Permission Tiers**: Preserves strict single-owner allowlist security (`admin_users`).

---

## 9. Business Acceptance Criteria

1. **Categories Console (`/admin/categories`)**:
   - Owner can list all categories with active status and assigned initiative counts.
   - Owner can create a new category with bilingual names and custom slug.
   - Owner can edit bilingual labels and toggle `is_active`.
   - Owner cannot delete a category if initiatives are assigned to it (FK protection).
2. **Hero Console (`/admin/hero`)**:
   - Owner can view and toggle between `Studio Mode` and `Featured Initiative Mode`.
   - In Featured Mode, owner can select from published initiatives in a dropdown.
   - Owner can toggle the lifecycle indicator bar.
   - Changes persist to the singleton `hero_config` table.
3. **Philosophy Console (`/admin/philosophy`)**:
   - Owner can list all 4 studio principles with bilingual titles and descriptions.
   - Owner can edit principle copy across EN and ID simultaneously.
   - Owner can reorder principles.
4. **Security & Stability**:
   - All server actions strictly enforce owner authentication via `admin_users` allowlist.
   - TypeScript compilation (`npx tsc --noEmit`) passes with 0 errors.
   - Production build (`npm run build`) compiles cleanly with 0 regressions.

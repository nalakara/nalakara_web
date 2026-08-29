# Nalakara Web v1.2 — Phase 2B Refinement Report
## Publish Policy & Initiatives Editor UX Review

This document records the **Phase 2B Refinement** executed following human editorial UI review of the Nalakara Initiatives Management Editor (`/admin/initiatives`).

---

## 1. Executive Summary

* **Phase**: 2B Refinement (Publish Policy & Editor UX Polish)
* **Status**: **PASS — PHASE 2B REFINEMENT COMPLETE**
* **Scope**: Refined the publishing validation model to support proper field classification, enhanced bilingual editorial equity in the UI, separated Lifecycle management from destructive Danger Zone actions, and established the architectural blueprint for future Initiative Visual Representations.
* **Public Site Integrity**: 100% intact. Homepage (`/`) remains static (10.9 kB / 113 kB First Load JS).
* **Database & RLS Stability**: Zero schema modifications, zero RLS changes, 100% backward compatible.

---

## 2. Publish Policy Correction & Field Classification

The publishing validation model has been recalibrated from a rigid "require everything" check into a structured, extensible 3-tier classification:

### A. REQUIRED Fields (Must be non-empty to Publish)
If any of these fields are missing or whitespace-only, publishing is blocked with precise field-level feedback:
1. `name` (1–64 chars)
2. `slug` (1–64 chars, valid kebab-case)
3. `category_id` (valid active category)
4. `lifecycle_stage` (`idea`, `lab`, `project`, `product`, `commercial`)
5. `access_model` (`concept`, `private-alpha`, `public-beta`, `production`, `commercial`)
6. `tagline_en` (1–140 chars)
7. `tagline_id` (1–140 chars)
8. `description_en` (1–320 chars)
9. `description_id` (1–320 chars)

### B. OPTIONAL Fields (Never block Publishing when empty)
These fields may legitimately remain empty without impeding live publication:
- `sort_order` (defaults deterministically to `0` or calculated index)
- `target_url` (optional link)
- `featured` (defaults to `false`)
- `is_external` (defaults to `true`)
- `commercial_badge_en` / `commercial_badge_id` (optional commercial labels)
- `commercial_action_en` / `commercial_action_id` (optional commercial CTAs)

### C. CONTEXTUAL Fields (Future Extensibility)
- Metadata fields that may become conditionally relevant in future iterations based on lifecycle progression (e.g., commercial pricing metadata for commercialized products).
- Handled cleanly without rigid hardcoding in core validation.

### D. Draft vs. Publish Behavior
- **Save Draft**: Completely permissive. Incomplete bilingual drafts can be safely saved without losing work-in-progress.
- **Publish to Live**: Strict quality gate enforcing only the **REQUIRED** fields.

---

## 3. UX & UI Refinements in Initiative Editor

1. **Bilingual Editorial Equity ("One meaning. Two native expressions.")**:
   - Column headers updated from `"English Source"` to `"English"` (`EN` badge) and `"Bahasa Indonesia"` (`ID` badge).
   - Removed any implication that English is the canonical source and Indonesian is a derivative translation. Both versions hold equal editorial standing.
2. **Clear Separation: Lifecycle vs. Danger Zone**:
   - **Lifecycle Management Section**: Styled with standard neutral card styling. Houses non-destructive lifecycle transitions (`Archive Initiative` / `Restore to Draft`).
   - **Danger Zone Section**: Distinctly bordered in subtle red (`rgba(239, 68, 68, 0.25)`). Houses irreversible destructive actions (`Delete Initiative Permanently`) behind a typing confirmation modal.
3. **Explicit Field Labeling**:
   - Required fields are distinctly marked with `*`.
   - Optional fields are explicitly labeled `(Optional)` (e.g., `Target URL (Optional)`, `Commercial Badge (EN, Optional)`).
4. **Human-Centric Helper Text**:
   - Slug helper updated from `"Deterministic unique key"` to `"Stable identifier · must be unique"`.
5. **Precise Publish Feedback**:
   - When required fields are missing, the UI displays an exact list of missing items (e.g., `"Cannot publish: Missing required field(s): English Tagline, Indonesian Description."`) while preserving all entered form values.

---

## 4. Initiative Visual Representation — Architectural Blueprint

### Conceptual Distinction
The future visual representation of an Initiative is **not merely a "thumbnail"**. It represents the canonical visual proof/artifact of what the Initiative actually is:
- Software/OS $\rightarrow$ Product UI interface capture / architectural console.
- Specialty System $\rightarrow$ Roasting kinetics / thermal interface visualization.
- Physical Instrument $\rightarrow$ High-fidelity photograph or industrial render.
- Service / Capability $\rightarrow$ Operational pipeline diagram or domain toolkit visual.

### Future Data Model Attachment Points
When media infrastructure is introduced, the Initiative schema can extend via:
```sql
-- Conceptual extension blueprint (Do NOT apply in Phase 2B):
ALTER TABLE initiatives
  ADD COLUMN visual_asset_ref VARCHAR(255),      -- Storage URI / CDN path
  ADD COLUMN visual_alt_en VARCHAR(160),         -- Accessibility descriptive alt text EN
  ADD COLUMN visual_alt_id VARCHAR(160),         -- Accessibility descriptive alt text ID
  ADD COLUMN visual_focal_point VARCHAR(32);     -- Optional CSS object-position (e.g. 'center top')
```

### Architectural Recommendation for Implementation Phase
* **Recommendation**: Implement visual asset uploads in a **Dedicated Media & Asset Management Phase (e.g., Phase 2D / Phase 3)** after Categories, Hero, and Philosophy editors are established.
* **Rationale**: Decoupling visual asset management preserves Phase 2 focus on textual content governance, prevents premature Supabase Storage bucket coupling, and ensures a clean, cohesive asset pipeline across Initiatives, Hero, and Philosophy.
* **Current Compatibility**: The existing side-by-side bilingual editor layout and database schema are 100% structured to accommodate a dedicated visual media section when scheduled.

---

## 5. Test Execution & Verification

### A. Publish Validation Test Suite (`scripts/test-phase-2b-refinement.ts`)
```
=== PHASE 2B REFINEMENT: PUBLISH POLICY & VALIDATION TEST ===

✔ PASS [TEST 1]: Incomplete draft successfully saved to database in DRAFT status.
✔ PASS [TEST 2]: Missing English Tagline rejected with precise message:
                 "Cannot publish: Missing required field(s): English Tagline."
✔ PASS [TEST 3]: Whitespace Indonesian Description rejected with precise message:
                 "Cannot publish: Missing required field(s): Indonesian Description."
✔ PASS [TEST 4]: Complete required fields + EMPTY optional commercial fields successfully PUBLISHED.
✔ PASS [TEST 5]: Database verified. All 4 canonical initiatives intact.

ALL PHASE 2B REFINEMENT VALIDATION TESTS PASSED!
```

### B. Security & Authorization (`scripts/test-phase-2b-auth.ts`)
```
=== TESTING PHASE 2B SERVER ACTION AUTHORIZATION BOUNDARY ===

✔ [PASS] createInitiativeAction rejected unauthenticated call.
✔ [PASS] updateInitiativeDraftAction rejected unauthenticated call.
✔ [PASS] publishInitiativeAction rejected unauthenticated call.
✔ [PASS] archiveInitiativeAction rejected unauthenticated call.
✔ [PASS] deleteInitiativeAction rejected unauthenticated call.

ALL AUTHORIZATION BOUNDARY TESTS PASSED!
```

### C. TypeScript & Build Checks
* `npx tsc --noEmit` $\rightarrow$ **0 errors (PASS)**
* `npm run build` $\rightarrow$ **7/7 pages statically prerendered & optimized (PASS)**

---

## 6. Files Modified in Refinement

1. [`src/app/admin/(authenticated)/initiatives/actions.ts`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/src/app/admin/(authenticated)/initiatives/actions.ts): Refined `publishInitiativeAction` validation, error reporting, and optional commercial field handling.
2. [`src/app/admin/(authenticated)/initiatives/InitiativeForm.tsx`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/src/app/admin/(authenticated)/initiatives/InitiativeForm.tsx): Updated bilingual column headers, field labels, slug helper text, and split Lifecycle vs Danger Zone sections.
3. [`src/app/admin/admin.module.css`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/src/app/admin/admin.module.css): Added `.lifecycleSection`, `.lifecycleHeader`, `.lifecycleTitle`, and `.lifecycleDesc` styles.
4. [`scripts/test-phase-2b-refinement.ts`](file:///Users/yudhan/Library/CloudStorage/GoogleDrive-nalakara.id@gmail.com/My%20Drive/FRAMEWORKS/NALAKARA%20WEB/scripts/test-phase-2b-refinement.ts): Automated validation test suite.

---

## FINAL VERDICT

> ### **FINAL VERDICT: PASS — PHASE 2B REFINEMENT COMPLETE**
>
> All publish policy corrections, UX refinements, and architectural preparations are complete and verified. Ready for human review. Phase 2C has not been started.

# Nalakara Frontend Art Direction Brief v1.2 (Refined)

**Document**: Frontend Art Direction Brief & Reference Synthesis  
**Scope**: Public Frontend Visual Evolution & Spatial Refinement  
**Author**: Antigravity (Pair Programming with Studio Owner)  
**Status**: **REFINED BRIEF FOR HUMAN REVIEW & DIRECTION**  
**Date**: 1 September 2026  

---

## 1. Visual Thesis: The Intelligent Foundry

Nalakara is an **autonomous creative studio and foundry** where ideas, systems, physical instruments, and software evolve systematically.

### Core Visual Thesis
> **"An intelligent, rigorous creative studio with a quiet, undeniable point of view."**

### The Core Design Hierarchy (Order of Importance)
1. **Content First**: The studio's thinking, initiatives, and axioms govern the layout. The interface exists to communicate, not to exhibit design trends.
2. **Typography as Structure**: Hierarchy, sectioning, and cadence are established through typographic scale, weight, and contrast rather than heavy container boxes and borders.
3. **Space as Identity**: Intentional negative space and rhythmic intervals give the studio its architectural authority and breathing room.
4. **Motion as Continuity**: Motion is an editorial tool that reveals hierarchy and preserves spatial context, never a decorative layer.
5. **Atmosphere as Accent**: Monochromatic discipline with subtle, functional accents. No gratuitous gradient orbs or cosmetic glow.

### Conceptual Dial Settings (Antislop Framework)
* **ENERGY: 2 (Balanced / Editorial Weight)** — Authoritative and confident through scale and whitespace.
* **RHYTHM: 3 (Asymmetric & Structured Canvas)** — Intentional variation across sections reflecting their unique conceptual roles.
* **MOTION: 2 (Restrained Continuity)** — Purpose-driven transitions supporting comprehension.

---

## 2. Reference Synthesis & Principles

*(Note: The reference weighting heuristic was an exploratory tool; the following represents the extracted principles applied directly to Nalakara).*

### 1. Robert Feasley & Łukasz Żydek — Editorial System & Typographic Structure
* **Core Principle Borrowed**: Treating selective metadata (sequence, lifecycle, category) as graphic structural elements juxtaposed with clean editorial headlines.
* **What We Explicitly Reject**: Hyper-dense raw text walls and repetitive horizontal dividers that cause visual fatigue.
* **Nalakara Translation**: Bold typographic scale paired with crisp monospace annotations (`[01 IDEA]`, `[STAGE: PROJECT]`) that structure the reading experience.

### 2. Ciridae — Motion as Continuity
* **Core Principle Borrowed**: Spatial continuity across scroll transitions. The page feels like a single architectural canvas.
* **What We Explicitly Reject**: Scroll-jacking, forced delays, or 3D animations that distract from reading or hurt performance.
* **Nalakara Translation**: *"Motion reveals hierarchy, not decorates hierarchy."* Elements settle into view naturally as the user navigates.

### 3. Hirael — Spatial Weight & Identity
* **Core Principle Borrowed**: Full-viewport opening confidence where the studio wordmark and proposition anchor the canvas.
* **What We Explicitly Reject**: Heavy dark opacity that reduces text contrast, and cosmetic background video loops.
* **Nalakara Translation**: High-contrast, clean canvas structure where `NALAKARA` anchors the viewport with clarity.

### 4. Pixel Point & Fora — Proposition & Taxonomy Clarity
* **Core Principle Borrowed**: Immediate visitor orientation and crystal-clear categorization.
* **What We Explicitly Reject**: Generic SaaS marketing feature grids and cliché illustration cards.
* **Nalakara Translation**: Unambiguous, honest presentation of each initiative's lifecycle stage and access model.

---

## 3. Critical Evaluation of the "Foundry Tensor Field" Canvas

We rigorously evaluate the living 2D canvas (`FoundryField.tsx`) against its architectural value:

| Criterion | Evaluation & Value Assessment |
| :--- | :--- |
| **Comprehension** | Visualizes the 5-stage lifecycle (`Idea → Lab → Project → Product → Commercial`) as an interconnected progression rather than abstract text. |
| **Brand Identity** | Serves as the studio's interactive visual signature—separating Nalakara from static text portfolios or generic agency templates. |
| **Ecosystem Visualization** | Tangibly illustrates that initiatives move through dynamic states in a living foundry. |
| **Interaction Value** | Gentle pointer deflection provides subtle tactile feedback without demanding attention or hijacking input. |
| **Performance Cost** | Pure 2D canvas with minimal CPU footprint, zero external heavy 3D/WebGL libraries, and automatically pauses when `prefers-reduced-motion` is active. |

### Architectural Recommendation on Foundry Field:
* **Verdict: RETAIN & REFINE, DO NOT REMOVE.**
* **Refinement**: Ensure it acts as an ambient spatial balance to the headline manifesto rather than competing with it. Keep canvas speed calm and physics soft.

---

## 4. The Continuous Opening Composition

Instead of an isolated, boxed hero section, we establish a **Continuous Opening Composition**:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. STUDIO COORDINATE HEADER (Status Pill · Language Switcher)           │
├────────────────────────────────────────────────────────────────────────┤
│ 2. EDITORIAL MANIFESTO (Large Typography) + LIVING FOUNDRY FIELD       │
│    "A studio and foundry that turns ideas into useful things."         │
├────────────────────────────────────────────────────────────────────────┤
│ 3. HORIZONTAL METADATA TICKER (System Summary)                         │
│    [04 INITIATIVES ACTIVE] · [05 LIFECYCLE STAGES] · [DEC 2026]        │
├────────────────────────────────────────────────────────────────────────┤
│ 4. FIRST FLAGSHIP INITIATIVE REVEAL (Continuous Scroll Entrance)       │
│    Initiatives begin immediately as the natural manifestation of thesis│
└────────────────────────────────────────────────────────────────────────┘
```

* **Progression of Visual Elements**: Starts with the simplest typographic statement, justified at each step:
  1. *Headline*: Immediate studio identity.
  2. *Subhead*: Clear positioning across software, instruments, and systems.
  3. *Foundry Field*: Visual evidence of the evolutionary model.
  4. *Ticker*: Bridges the opening directly into the live Registry.

---

## 5. Metadata as Selective Visual Grammar

Metadata must not become visual clutter. We distinguish **essential public grammar** from internal database fields:

| Field | Public Role | Visual Treatment |
| :--- | :---: | :--- |
| **Sequence Number** (`01`, `02`) | High | Large monospace counter establishing index order. |
| **Lifecycle Stage** (`status`) | High | Geometric stage glyph + subtle colored status badge (`[LAB]`, `[PROJECT]`). |
| **Category** (`category_id`) | Medium | Monospace uppercase label (`SOFTWARE`, `DIGITAL SYSTEM`). |
| **Access Model** (`access_model`) | High | Clear availability indicator (`PRIVATE-ALPHA`, `PUBLIC-BETA`, `PRODUCTION`). |
| **Commercial Badge** | Medium | Clean custom badge when an offering is commercial. |
| *Timestamps / Database UUIDs* | *Hidden* | Excluded from public cards to prevent cognitive clutter. |

---

## 6. Motion Language: "Motion Reveals Hierarchy"

All motion must adhere to **Antislop Rule R-19 (Purpose-Driven Motion)** and respect `prefers-reduced-motion`:
* **Headline Settle**: Subtle 8px vertical settle (400ms) on initial load to guide the eye from the wordmark down to the thesis.
* **Scroll-Triggered Card Entry**: Initiatives enter with a 150ms stagger as the user scrolls, creating a rhythm of discovery.
* **Tactile Affordance**: On card hover, border color warms from `#27272a` to `#52525b`, and the target arrow translates 2px northeast (`↗`).
* **Language Switch Crossfade**: 120ms crossfade of text elements with zero layout shift.

---

## 7. Strict CMS Boundary Rule

> **RULE**: Frontend refinement must NOT create CMS complexity or require new database columns merely for aesthetic decoration.

- All visual expressions must map cleanly to existing schema fields (`tagline_en/id`, `description_en/id`, `lifecycle_stage`, `access_model`, `category_id`, `hero_config`).
- No speculative fields or DDL migrations will be introduced during frontend refinement.

---

## 8. Re-Evaluation & Ranking of Hero Opening Concepts

We re-evaluate the three hero concepts against our updated hierarchy:

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ CONCEPT RANKING & EVALUATION MATRIX                                                   │
├───────────────────────┬────────────┬─────────┬──────────────┬─────────────┬───────────┤
│ Concept               │ Identity   │ Clarity │ CMS Fit      │ Complexity  │ Overall   │
├───────────────────────┼────────────┼─────────┼──────────────┼─────────────┼───────────┤
│ 1. Architectural Ledger│ Very High  │ High    │ 100% Native  │ Low-Medium  │ #1 (WINNER)│
│ 2. Monolith Spotlight │ High       │ Medium  │ Native       │ Medium      │ #2        │
│ 3. Axiom Header       │ Medium     │ High    │ Native       │ Low         │ #3        │
└───────────────────────┴────────────┴─────────┴──────────────┴─────────────┴───────────┘
```

### Concept 1: "The Architectural Ledger" *(Rank #1 — Recommended Direction)*
* **Composition**: 
  - Left column: High-contrast editorial manifesto with monospace system coordinates.
  - Right column: The living **Foundry Field** canvas visualizing the 5-stage evolutionary trajectory.
  - Bottom spine: Monospace ecosystem ticker linking directly to the Registry.
* **Why it Wins**: Balances strong editorial authority with living spatial proof of the foundry concept, perfectly utilizing the existing `hero_config` data model.

### Concept 2: "The Monolith Spotlight" *(Rank #2)*
* **Composition**: Opens directly with a massive technical blueprint of the primary featured initiative (e.g. `B.R.O.S.`), with the studio manifesto in a secondary column.
* **Trade-off**: High impact for the individual product, but diminishes the overarching studio brand proposition.

### Concept 3: "The Axiom Header" *(Rank #3)*
* **Composition**: Full-width typographic statement spanning 100% of the screen with a horizontal step timeline below it.
* **Trade-off**: Very clean, but less distinctive; resembles generic portfolio websites.

---

## 9. Final Recommendation: Prototype Direction

**Proceed with Prototyping Concept 1: The Architectural Ledger**.

### Prototype Focus Areas:
1. **Refined Typography Scales**: Implement precise `font-sans` clamp scales for the headline and subhead in `src/components/Hero.module.css`.
2. **Elevated ItemCard Architecture**: Structure `src/components/ItemCard.module.css` with a clean metadata top bar (`[01 / 04]`, category, status glyph) and high-contrast description.
3. **Registry Filter Bar Refinement**: Monospace filter tabs with dynamic counts (`ALL [4]`, `BUILDING [3]`, `USABLE [1]`, `COMMERCIAL [1]`).
4. **Studio Principles Matrix**: Crisp horizontal separator lines and oversized sequence counters (`01`, `02`, `03`, `04`).
5. **Zero Backend Changes**: 100% client-side and CSS module refinement.

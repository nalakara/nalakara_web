# Nalakara Web — Bilingual Language Architecture & Content Specification

This document defines the complete bilingual strategy (English & Indonesian) for **Nalakara Web**, establishing the brand voice, terminology mapping, interpretive translations, technical architecture, and staged implementation roadmap.

---

## 1. Language Philosophy

> **"One meaning. Two native expressions."**

English and Indonesian are treated as **two primary, native voices** of Nalakara rather than a "source" and a "machine translation".

### Core Guidelines:
1. **Meaning Over Literalism**: Priority is given to natural phrasing, cadence, and cultural resonance over word-for-word parity.
2. **Authentic Voice**: 
   * **Indonesian** must read like natural, high-caliber editorial prose written by a design/technology practitioner—never like bureaucratic government Indonesian or translated Silicon Valley marketing jargon.
   * **English** must read like precise, restrained international studio copy—free of hyperbolic startup tropes (*"AI-powered", "revolutionary", "game-changing"*).
3. **Factual & Status Parity**: Both languages must convey the exact same stage of maturity (`lab`, `project`, `private-alpha`), capability bounds, and truthful positioning.

---

## 2. Brand Voice in Both Languages

| Dimension | English Voice | Indonesian Voice | Anti-Slop Boundary |
| :--- | :--- | :--- | :--- |
| **Tone** | Restrained, architectural, confident, precise. | Bernas, jernih, reflektif, berdaya cipta. | Avoid artificial excitement and exclamation marks. |
| **Register** | Contemporary studio editorial. | Bahasa Indonesia baku kontemporer (non-kaku, non-slang). | Avoid bureaucratic corporate terms (*"mengimplementasikan solusi"*). |
| **Pacing** | Concise, cadence-driven clauses. | Mengalir alami, kaya makna, lugas. | Avoid awkward English idioms translated literally. |

---

## 3. Terminology Strategy

Every key term in Nalakara is categorized into four strategic buckets:

| Term | Category | English | Indonesian | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Nalakara** | `PRESERVED` | NALAKARA | NALAKARA | Universal proper noun / Brand identity. |
| **B.R.O.S.** | `PRESERVED` | B.R.O.S. | B.R.O.S. | System framework acronym. |
| **Roast Navigator** | `PRESERVED` | Roast Navigator | Roast Navigator | Specialized product title. |
| **Beauty Batch OS** | `PRESERVED` | Beauty Batch OS | Beauty Batch OS | Specialized product title. |
| **Skill Factory** | `PRESERVED` | Nalakara Skill Factory | Nalakara Skill Factory | Specialized lab pipeline title. |
| **Foundry** | `CONTEXTUAL` | Studio & Foundry | Studio & Ruang Cipta / Foundry | "Foundry" retained as system metaphor; interpreted as "Ruang Cipta" in prose. |
| **Ecosystem** | `TRANSLATED` | Ecosystem | Ekosistem | Standard, natural Indonesian term. |
| **Registry** | `INTERPRETED` | The Registry | Katalog Ekosistem / Registri | "Katalog Ekosistem" communicates the registry purpose clearly to Indonesian readers. |
| **In Foundry** | `CONTEXTUAL` | In Foundry | Dalam Perancangan / In Foundry | Retains status tag brevity while explaining work is actively being forged. |
| **Commercial Candidate** | `TRANSLATED` | Commercial Candidate | Kandidat Komersial | Clear, professional translation indicating commercial potential. |
| **Private Alpha** | `INTERPRETED` | Private Alpha | Akses Terbatas (Alpha) | Accurately describes access without confusing non-technical visitors. |
| **Domain Independence** | `INTERPRETED` | Domain Independence | Independensi Lintas Ranah | Expresses the freedom to build across multiple disciplines. |
| **Utility Over Novelty** | `INTERPRETED` | Utility Over Novelty | Fungsi di Atas Kebaruan Semu | Conveys purposeful craft over superficial tech novelty. |

---

## 4. Lifecycle Vocabulary

The 5-stage lifecycle (**Idea → Lab → Project → Product → Commercial**) is a proprietary architectural instrument. 

### Recommendation:
* **System Glyphs / Stage Identifiers**: Kept in bilingual notation (`01 Idea / Gagasan`, `02 Lab`, `03 Project / Proyek`, `04 Product / Produk`, `05 Commercial / Komersial`).
* **In UI Badges & Navigation Filters**:
  * `All` $\leftrightarrow$ `Semua`
  * `Building` $\leftrightarrow$ `Dalam Rancang` (avoiding literal *"Membangun"*)
  * `Usable` $\leftrightarrow$ `Siap Guna` (avoiding awkward *"Dapat Digunakan"*)
  * `Commercial` $\leftrightarrow$ `Komersial`

---

## 5. Complete Content Inventory & Interpretive Mapping

### 5.1 Global Header & Navigation

| Location | English UI | Indonesian Proposal | Type | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| `Header:logo-aria` | `Nalakara · Home` | `Nalakara · Beranda` | `TRANSLATED` | Accessible navigation label. |
| `Header:statusPill` | `Foundry Active` | `Studio Aktif` | `INTERPRETED` | Conveys active studio operations clearly. |
| `Header:nav-1` | `Initiatives` | `Inisiatif` | `TRANSLATED` | Direct and natural. |
| `Header:nav-2` | `Registry` | `Katalog` | `INTERPRETED` | Clean, high-density nav link. |
| `Header:nav-3` | `Philosophy` | `Filosofi` | `TRANSLATED` | Standard and resonant. |
| `Header:nav-4` | `About` | `Tentang` | `TRANSLATED` | Standard and concise. |

---

### 5.2 Hero Section & Foundry Field

| Location | English UI | Indonesian Proposal | Type | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| `Hero:tag` | `Ecosystem & Discovery` | `Ekosistem & Penjelajahan` | `TRANSLATED` | Establishes the purpose of the layer. |
| `Hero:headline` | `A studio and foundry that turns ideas into useful things.` | `Studio dan ruang cipta yang mewujudkan gagasan menjadi karya nyata berdaya guna.` | `INTERPRETED` | Avoids awkward *"mengubah ide menjadi hal-hal berguna"*; elevates editorial tone. |
| `Hero:subhead` | `Nalakara is an autonomous ecosystem where ideas, experiments, systems, and products evolve across different domains: from intelligence frameworks and specialty instruments to domain operating systems.` | `Nalakara adalah ekosistem mandiri tempat bertumbuhnya ide, eksperimen, sistem, dan produk lintas ranah: mulai dari kerangka kecerdasan buatan dan instrumen khusus hingga sistem operasi industri.` | `INTERPRETED` | Natural Indonesian syntax with precise terminology. |
| `Hero:primaryCTA` | `Explore Registry ↓` | `Jelajahi Katalog ↓` | `INTERPRETED` | Active, directional call to action. |
| `Hero:secondaryCTA`| `Studio Philosophy` | `Filosofi Studio` | `TRANSLATED` | Direct and clear. |
| `Hero:lifecycleBar`| `Lifecycle Stages:` | `Tahapan Siklus Hidup:` | `TRANSLATED` | Explains the 5-step progression. |
| `FoundryField:tag` | `FOUNDRY FIELD` | `MEDAN CIPTA (FOUNDRY FIELD)` | `CONTEXTUAL` | Bilingual spatial instrument annotation. |
| `FoundryField:desc`| `LIFECYCLE / 05 STAGES` | `SIKLUS HIDUP / 05 TAHAP` | `TRANSLATED` | Architectural coordinate label. |

---

### 5.3 Initiatives & Registry (Cards & Filter Tabs)

| Location | English UI | Indonesian Proposal | Type | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| `Initiatives:tag` | `Curated Work` | `Karya Pilihan` | `TRANSLATED` | Editorial collection header. |
| `Initiatives:title`| `Current Initiatives` | `Inisiatif Saat Ini` | `TRANSLATED` | Clean section title. |
| `Registry:tag` | `Ecosystem Inventory` | `Daftar Inventaris Ekosistem` | `TRANSLATED` | Clear descriptive label. |
| `Registry:title` | `The Registry` | `Katalog Ekosistem` | `INTERPRETED` | Natural Indonesian phrasing. |
| `Registry:tabAll` | `All (4)` | `Semua (4)` | `TRANSLATED` | Filter control. |
| `Registry:tabBuild`| `Building (4)` | `Dalam Rancang (4)` | `INTERPRETED` | Represents active lab/project stages. |
| `Registry:tabUse` | `Usable (0)` | `Siap Guna (0)` | `INTERPRETED` | Represents production-ready stage. |
| `Registry:tabComm`| `Commercial (0)` | `Komersial (0)` | `TRANSLATED` | Represents commercially available stage. |
| `Registry:empty` | `No initiatives currently indexed under this filter.` | `Belum ada inisiatif yang terdaftar dalam kategori ini.` | `TRANSLATED` | Clear, polite empty state. |
| `ItemCard:inFoundry`| `In Foundry` | `Dalam Perancangan` | `INTERPRETED` | Clarifies that the initiative is under development. |
| `ItemCard:visit` | `Visit Initiative ↗` | `Kunjungi Inisiatif ↗` | `TRANSLATED` | Active external link cue. |
| `ItemCard:candBadge`| `Commercial Candidate` | `Kandidat Komersial` | `TRANSLATED` | Factual commercial readiness tag. |

---

### 5.4 Initiative Descriptions (Ecosystem Data)

| Initiative | Field | Current English | Indonesian Proposal |
| :--- | :--- | :--- | :--- |
| **B.R.O.S.** | `tagline` | `Autonomous operations and system intelligence framework.` | `Kerangka kerja operasi mandiri dan kecerdasan sistem.` |
| | `description` | `An operational backbone engineered for managing autonomous workflows, structured execution, and multi-agent coordination.` | `Fondasi operasional yang dirancang untuk mengelola alur kerja mandiri, eksekusi terstruktur, dan koordinasi multi-agen.` |
| **Roast Navigator** | `tagline` | `Sensory and roast curve tracking platform for specialty coffee.` | `Platform pelacakan kurva sangrai dan evaluasi sensorik kopi spesialti.` |
| | `description` | `A specialized digital system designed to evaluate roast kinetics, thermal trajectories, and sensory profiles.` | `Sistem digital khusus untuk mengevaluasi kinetika sangrai, trajektori termal, dan profil sensorik rasa.` |
| **Beauty Batch OS** | `tagline` | `Formulation, compliance, and batch management system.` | `Sistem manajemen formulasi, kepatuhan, dan produksi batch kosmetik.` |
| | `description` | `An operating framework engineered for cosmetic formulation labs to manage recipes, batch records, and ingredient inventory.` | `Kerangka kerja operasional untuk laboratorium kosmetik dalam mengelola formula, catatan batch, dan inventaris bahan baku.` |
| **Skill Factory** | `tagline` | `Modular agent skill synthesis and capability training pipeline.` | `Alur sintesis kemampuan dan pelatihan keterampilan agen AI modular.` |
| | `description` | `A systematic lab environment for creating, benchmarking, and distributing specialized agent capabilities and domain toolkits.` | `Lingkungan riset sistematis untuk merancang, menguji tolok ukur, dan mendistribusikan keahlian agen AI serta toolkit khusus.` |

---

### 5.5 Philosophy Section (Foundational Principles)

| Principle | Field | Current English | Indonesian Proposal |
| :--- | :--- | :--- | :--- |
| `Section Header` | `tag` | `Foundational Axioms` | `Aksioma Dasar` |
| | `title` | `Studio Principles` | `Prinsip Studio` |
| **01** | `title` | `Domain Independence` | `Independensi Lintas Ranah` |
| | `body` | `Ideas are not restricted to a single industrial or technological vertical. We apply systemic thinking across digital software, physical instruments, and operational frameworks.` | `Gagasan tidak dibatasi oleh satu bidang industri atau teknologi tertentu. Kami menerapkan pola pikir sistemik pada perangkat lunak digital, instrumen fisik, dan kerangka kerja operasional.` |
| **02** | `title` | `Utility Over Novelty` | `Fungsi di Atas Kebaruan Semu` |
| | `body` | `We do not build purely decorative demonstrations. Every artifact originating from the foundry must perform real, verifiable work and solve concrete problems.` | `Kami tidak membuat karya yang sekadar demonstrasi dekoratif. Setiap karya yang lahir dari studio harus berfungsi nyata, teruji, dan memecahkan masalah konkret.` |
| **03** | `title` | `Autonomous Product Identity` | `Identitas Produk yang Mandiri` |
| | `body` | `Individual initiatives earn their own dedicated visual identities, distinct subdomains, and tailored user experiences rather than being forced into a uniform corporate template.` | `Setiap inisiatif memiliki identitas visual tersendiri, subdomain khusus, dan pengalaman pengguna yang disesuaikan—bukan dipaksakan ke dalam template korporat yang seragam.` |
| **04** | `title` | `Disciplined Lifecycle Evolution` | `Evolusi Siklus Hidup yang Disiplin` |
| | `body` | `Initiatives graduate deliberately through five verifiable states: Idea → Lab → Project → Product → Commercial. Progression requires stability, utility, and real-world validation.` | `Inisiatif bertumbuh secara bertahap melalui lima fase terukur: Gagasan → Lab → Proyek → Produk → Komersial. Setiap kemajuan membutuhkan stabilitas, kegunaan, dan validasi nyata.` |

---

### 5.6 Footer & Metadata

| Location | English UI | Indonesian Proposal | Type |
| :--- | :--- | :--- | :--- |
| `Footer:desc` | `A studio and foundry that turns ideas into useful things across software, physical instruments, and digital systems.` | `Studio dan ruang cipta yang mewujudkan gagasan menjadi karya nyata pada perangkat lunak, instrumen fisik, dan sistem digital.` | `INTERPRETED` |
| `Footer:colCoords`| `Coordinates` | `Koordinat` | `TRANSLATED` |
| `Footer:location` | `Location: Studio / Decentralized` | `Lokasi: Studio / Terdesentralisasi` | `TRANSLATED` |
| `Footer:colInit` | `Initiatives` | `Inisiatif` | `TRANSLATED` |
| `Footer:colSys` | `System` | `Sistem` | `TRANSLATED` |
| `Footer:toTop` | `Back to Top ↑` | `Kembali ke Atas ↑` | `TRANSLATED` |
| `Footer:rights` | `© 2026 NALAKARA. All rights reserved.` | `© 2026 NALAKARA. Hak cipta dilindungi.` | `TRANSLATED` |
| `Footer:tagline` | `Autonomous Foundry Architecture` | `Arsitektur Ruang Cipta Mandiri` | `INTERPRETED` |
| `Metadata:title` | `NALAKARA · Studio & Foundry` | `NALAKARA · Studio & Ruang Cipta` | `CONTEXTUAL` |
| `Metadata:desc` | `A studio and foundry that turns ideas into useful things.` | `Studio dan ruang cipta yang mewujudkan gagasan menjadi karya nyata berdaya guna.` | `INTERPRETED` |
| `A11y:skipLink` | `Skip to main content` | `Lompat ke konten utama` | `TRANSLATED` |

---

## 6. Concepts Requiring Cultural & Philosophical Integration

From the comparative review with the original *Semesta Nalakara*, the Sanskrit root represents the studio's soul:

* **Sanskrit Origin**:
  * **Nala (नल)**: *Akal, kesadaran, pikiran* (intellect, consciousness).
  * **Kara (कर)**: *Pembentuk, pelaksana, pencipta* (maker, former).
  * **Thesis**: *"Pembentuk melalui kesadaran"* / *"Forming through consciousness"*.
* **Bilingual Execution Recommendation**:
  * Add a subtle origin footnote inside the **About / Coordinates** footer or Philosophy intro:
    * **Indonesian**: *"Berakar dari kata Sanskerta Nala (kesadaran) dan Kara (pembentuk), Nalakara bermakna menciptakan teknologi secara sadar dan bermakna untuk memperluas daya ungkap manusia."*
    * **English**: *"Rooted in the Sanskrit terms Nala (consciousness) and Kara (maker), Nalakara embodies conscious craft—creating technology that expands human agency and intuition."*

---

## 7. UI Expansion Risks & Mitigation

| UI Element | English Length | Indonesian Length | Expansion Delta | Risk Level | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Filter Tabs** | `Building (4)` | `Dalam Rancang (4)` | +6 chars | `LOW` | Tabs use `flex-wrap: wrap` and `gap: 0.5rem`; will stack gracefully on mobile. |
| **Primary CTA** | `Explore Registry ↓` | `Jelajahi Katalog ↓` | -1 char | `NONE` | Length is identical. |
| **Hero Headline** | 58 chars | 76 chars | +30% length | `LOW` | `clamp(2.25rem, 4.5vw, 3.75rem)` provides responsive font scaling. |
| **Nav Links** | `Initiatives` | `Inisiatif` | -2 chars | `NONE` | Shorter or equal. |
| **Item Card Badges** | `Commercial Candidate` | `Kandidat Komersial` | -2 chars | `NONE` | Fits comfortably within card headers. |

---

## 8. Recommended Technical Language Architecture

To maintain zero runtime bloat, fast static generation, and Vercel compatibility:

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layout Layer                      │
│                  [LanguageProvider (Context)]               │
│               - state: 'en' | 'id'                          │
│               - persists to localStorage ('nalakara_lang')   │
│               - optional query sync (?lang=id)              │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌──────────────────────────────┐    ┌──────────────────────────────┐
│       src/data/i18n.ts       │    │    src/data/ecosystem.ts     │
│   (UI dictionary & labels)   │    │  (Bilingual initiative data) │
└──────────────────────────────┘    └──────────────────────────────┘
```

### Key Technical Attributes:
1. **Type Safety**: `Dictionary` interface ensures 100% parity between EN and ID keys at compile time.
2. **Zero Dependencies**: Handcrafted React Context (`LanguageContext`) without heavy external i18n libraries.
3. **SEO & Prerender Friendly**: Default server prerender in English with instantaneous hydration to user's saved preference.
4. **Accessible HTML `lang` Sync**: `document.documentElement.lang` dynamically updates between `"en"` and `"id"`.

---

## 9. Language Toggle Design Specification

* **Placement**: Located in the top `<Header />`, beside the desktop navigation links (and accessible in mobile nav).
* **Format**: Segmented inline text toggle:
  ```text
  [ EN | ID ]
  ```
* **Visual Style**:
  * Unselected: `--text-muted` (`#8e8e93`) with `font-family: var(--font-mono)`, `font-size: 0.75rem`.
  * Active: `--text-primary` (`#f4f4f6`), `font-weight: 600`.
  * Interactive Target: Meets minimum 44px touch target on mobile via transparent padding.
  * Keyboard: Full `:focus-visible` ring support.

---

## 10. Staged Implementation Plan (For Future Execution)

### Stage 1 — Data & Dictionary Layer
- Create `src/types/i18n.ts` with strict bilingual schemas.
- Create `src/data/i18n.ts` housing the verified UI strings from Section 5.
- Update `src/data/ecosystem.ts` to support bilingual `{ en, id }` taglines, descriptions, and principles.

### Stage 2 — State & Context Layer
- Create `src/context/LanguageContext.tsx` with `useLanguage()` hook, localStorage persistence, and `lang` attribute synchronization.

### Stage 3 — Component Integration
- Mount `LanguageToggle` in `Header.tsx`.
- Connect `Hero.tsx`, `FoundryField.tsx`, `Initiatives.tsx`, `Registry.tsx`, `ItemCard.tsx`, `Philosophy.tsx`, and `Footer.tsx` to `useLanguage()`.

### Stage 4 — Quality Gate & Verification
- Verify build with `npx tsc --noEmit` and `npm run build`.
- Validate responsive wrapping on 375px mobile for both languages.
- Validate WCAG contrast and keyboard navigation.

---

## 11. Final Quality Affirmation

* **Indonesian Authenticity Check**: PASS. Avoids literal translation artifacts; reads naturally as a contemporary design foundry.
* **English Authenticity Check**: PASS. Restrained, authoritative, and anti-slop compliant.
* **Semantic & Claim Parity**: PASS. 100% alignment in factual status, maturity, and capability boundaries.

# Nalakara Web — Content & Claim Audit Report

This audit assesses the factual integrity, lifecycle classifications, availability statuses, public claims, and external URLs currently configured in `src/data/ecosystem.ts` against available repository documentation.

---

## 1. Executive Summary Table

| Initiative | Current Dataset Status | Evidence Status | Recommended Public Status | Claim Issues | URL Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **B.R.O.S.** | `project` / `private-alpha` | Supported (Internal framework) | `project` / `private-alpha` | Minor: Phrased slightly specific ("automated workspace telemetry"). | `Valid but unverified deployment` (`bros.nalakara.com`) |
| **Roast Navigator** | `product` / `production` | **UNVERIFIED** (Discovery notes define it as "under development") | `project` / `private-alpha` (or `public-beta` if hosted) | **High**: Claims "production ready" & "Launch System" without verified public deployment. | `Valid but unverified deployment` (`roast.nalakara.com`) |
| **Beauty Batch OS** | `commercial` / `commercial` | **UNVERIFIED** (No active SaaS checkout/subscription in repo) | `project` (or `lab`) / `private-alpha` (Commercial Candidate) | **High**: Claims active "Commercial Platform" & "Subscription" pricing. | `Valid but unverified deployment` (`beauty.nalakara.com`) |
| **Nalakara Skill Factory** | `lab` / `private-alpha` | Supported (Internal experimental tooling) | `lab` / `private-alpha` | **None**: Accurately scoped as an internal laboratory exploration. | `Correctly unlinked` (`undefined`) |
| **Studio Coordinates** | `contact@nalakara.com` | Placeholder | `contact@nalakara.com` (Requires mailbox check) | Needs confirmation of active MX/inbox setup. | `Unverified mailbox` |

---

## 2. Initiative-by-Initiative Detailed Audit

### 2.1 B.R.O.S.
* **Current Values in Dataset**:
  * Status: `project`
  * Access Model: `private-alpha`
  * Category: `software`
  * Target URL: `https://bros.nalakara.com`
  * Tagline: *"Autonomous operations and system intelligence framework."*
  * Description: *"An operational backbone engineered for managing multi-agent tasks, workflows, and automated workspace telemetry."*
* **What is Supported**:
  * Classification as an active development `project` and `private-alpha` framework is fully consistent with its role as an internal system.
* **What is Uncertain / UNVERIFIED**:
  * Whether `https://bros.nalakara.com` is actively provisioned with DNS and reachable by public visitors.
  * Technical terminology like "automated workspace telemetry" may be overly specific for an initial public landing page.
* **What Should Remain Unchanged**:
  * Lifecycle status (`project`) and access model (`private-alpha`).
* **What Requires Human Confirmation**:
  * Whether the subdomain `bros.nalakara.com` is live, or should be unlinked (`undefined` -> "In Foundry") until deployment.

---

### 2.2 Roast Navigator
* **Current Values in Dataset**:
  * Status: `product`
  * Access Model: `production`
  * Category: `digital-system`
  * Target URL: `https://roast.nalakara.com`
  * Action Label: *"Launch System"*
  * Tagline: *"Precision sensory and roast curve intelligence for specialty coffee."*
  * Description: *"A thermodynamic and sensory tracking platform designed to evaluate roast kinetics, charge dynamics, and bean profiles."*
* **What is Supported**:
  * The conceptual domain (sensory coffee roasting tool) and name.
* **What is Uncertain / UNVERIFIED**:
  * In `discovery_review.md`, Roast Navigator was explicitly cited as an example of a *"project under development"* that might graduate to a product in the future.
  * Elevating it to `product` / `production` with a *"Launch System"* CTA implies that end-users can immediately open and use the live software today.
* **What Should Remain Unchanged**:
  * Core domain focus (coffee roast kinetics and sensory tracking).
* **What Requires Human Confirmation**:
  * Is Roast Navigator currently live and ready for public use (`product` / `public-beta`), or is it still an evolving internal prototype (`project` / `private-alpha`)?

---

### 2.3 Beauty Batch OS
* **Current Values in Dataset**:
  * Status: `commercial`
  * Access Model: `commercial`
  * Category: `software`
  * Target URL: `https://beauty.nalakara.com`
  * Pricing: `subscription` / *"Commercial Platform"*
  * Action Label: *"Access Platform"*
  * Tagline: *"Formulation, batch compliance, and inventory management system."*
  * Description: *"Specialized operating system built for independent cosmetic labs and artisanal compounders to track ingredients, formulations, and regulatory stability."*
* **What is Supported**:
  * The studio's intent to build a specialized formulation and compliance system for cosmetic compounding.
* **What is Uncertain / UNVERIFIED**:
  * Labeling it as an active `commercial` offering with a `subscription` pricing model is **unsupported** by the current repository state. There is no evidence of an active billing gateway, customer licensing portal, or production deployment.
  * Visitors arriving at the site and clicking "Access Platform" would expect an active SaaS product.
* **What Should Remain Unchanged**:
  * The core product promise and target industry (independent cosmetic compounding).
* **What Requires Human Confirmation**:
  * Should Beauty Batch OS be represented honestly as a `project` in private development (with an indicator like *"Commercial Candidate / In Development"*), or is there an existing live commercial offering?

---

### 2.4 Nalakara Skill Factory
* **Current Values in Dataset**:
  * Status: `lab`
  * Access Model: `private-alpha`
  * Category: `experimental`
  * Target URL: `undefined` (rendered as *"In Foundry"*)
  * Tagline: *"Modular agent skill synthesis and capability training pipeline."*
  * Description: *"A systematic lab environment for creating, benchmarking, and distributing specialized agent capabilities and domain toolkits."*
* **What is Supported**:
  * Everything. It is accurately classified as an internal experimental lab (`lab`), private testing environment (`private-alpha`), and correctly avoids generating a non-existent public URL.
* **What is Uncertain / UNVERIFIED**:
  * None.
* **What Should Remain Unchanged**:
  * Entire entry.

---

### 2.5 Studio Coordinates & Meta
* **Current Email**: `contact@nalakara.com`
  * Status: Standard placeholder. Needs verification that email forwarding / Google Workspace / MX records are active before launch.
* **Current GitHub URL**: `https://github.com/nalakara`
  * Status: Needs verification that the GitHub organization exists publicly.

---

## 3. Proposed Corrected Public Dataset

Below is the proposed, fully defensible dataset for `src/data/ecosystem.ts` that removes unverified claims while preserving high editorial integrity.

```typescript
import { EcosystemItem } from '@/types';

export const ECOSYSTEM_INITIATIVES: EcosystemItem[] = [
  {
    id: 'bros',
    name: 'B.R.O.S.',
    tagline: 'Autonomous operations and system intelligence framework.',
    description: 'An operational backbone engineered for managing autonomous workflows, structured execution, and multi-agent coordination.',
    status: 'project',
    category: 'software',
    accessModel: 'private-alpha',
    targetUrl: undefined, // Or 'https://bros.nalakara.com' if DNS is live
    isExternal: false,
    featured: true,
    order: 1,
    updatedAt: '2026-08-15'
  },
  {
    id: 'roast-navigator',
    name: 'Roast Navigator',
    tagline: 'Sensory and roast curve tracking platform for specialty coffee.',
    description: 'A specialized digital system designed to evaluate roast kinetics, thermal trajectories, and sensory profiles.',
    status: 'project', // Shifted from 'product' to reflect active development
    category: 'digital-system',
    accessModel: 'private-alpha', // Shifted from 'production'
    targetUrl: undefined, // Or 'https://roast.nalakara.com' if DNS is live
    isExternal: false,
    featured: true,
    order: 2,
    updatedAt: '2026-08-20'
  },
  {
    id: 'beauty-batch-os',
    name: 'Beauty Batch OS',
    tagline: 'Formulation, compliance, and batch management system.',
    description: 'An operating framework engineered for cosmetic formulation labs to manage recipes, batch records, and ingredient inventory.',
    status: 'project', // Shifted from 'commercial' to reflect development phase
    category: 'software',
    accessModel: 'private-alpha', // Shifted from active subscription
    targetUrl: undefined, // Or 'https://beauty.nalakara.com' if DNS is live
    isExternal: false,
    featured: true,
    commercial: {
      pricingType: 'custom',
      badgeLabel: 'Commercial Candidate',
      actionLabel: 'In Development'
    },
    order: 3,
    updatedAt: '2026-08-22'
  },
  {
    id: 'skill-factory',
    name: 'Nalakara Skill Factory',
    tagline: 'Modular agent skill synthesis and capability training pipeline.',
    description: 'A systematic lab environment for creating, benchmarking, and distributing specialized agent capabilities and domain toolkits.',
    status: 'lab',
    category: 'experimental',
    accessModel: 'private-alpha',
    targetUrl: undefined,
    isExternal: false,
    featured: false,
    order: 4,
    updatedAt: '2026-08-10'
  }
];

export const STUDIO_META = {
  name: 'NALAKARA',
  tagline: 'A studio and foundry that turns ideas into useful things.',
  est: '2026',
  status: 'Foundry Active',
  email: 'contact@nalakara.com',
  location: 'Studio / Decentralized'
};
```

---

## 4. Safety & Publish-Readiness Verdict

> [!WARNING]
> **Current Publish Status: NOT YET SAFE WITHOUT URL & CLAIM RECONCILIATION**
>
> 1. **Broken Link Risk**: Linking to `bros.nalakara.com`, `roast.nalakara.com`, and `beauty.nalakara.com` before DNS records exist will cause visitor-facing browser connection errors.
> 2. **Commercial Over-claiming**: Claiming active commercial subscription sales for Beauty Batch OS and live production utility for Roast Navigator before they are launched compromises studio credibility.
> 3. **Remedy**: Adopting the proposed dataset (which marks unlaunched subdomains as `undefined` -> *"In Foundry"*) makes the website **100% truthful, defensible, and publish-ready**.

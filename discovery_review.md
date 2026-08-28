# Nalakara.com — Initial Product & Architecture Discovery

This document establishes the product logic, content models, and technical architecture for **nalakara.com** prior to implementation.

---

## 1. Business Review

### Purpose of nalakara.com
Nalakara.com is not a standard corporate portal or a simple portfolio. It is the primary ecosystem entry point and parent discovery layer for a creative studio/foundry that turns ideas into useful digital, software, physical, and services-oriented products. It provides context, taxonomy, and cohesion for a diverse set of independent projects (e.g., B.R.O.S., Roast Navigator, Beauty Batch OS, Nalakara Skill Factory) that may otherwise carry completely distinct visual and brand identities.

### Primary Audiences
1. **Early Adopters & Co-Creators**: Developers, designers, and domain enthusiasts who want to track raw experiments, read build logs, and use early-stage tools (Labs/Projects).
2. **Customers & End Users**: Individuals and organizations seeking practical, polished solutions they can use or buy (Products/Commercial offerings).
3. **Collaborators & Partners**: Potential studio allies who want to understand the underlying philosophy, operational model, and principles driving Nalakara.

### Primary Visitor Journeys
* **The Explorer**: Lands on the homepage, gets a high-level view of the ecosystem's philosophy, browses active experiments, and transitions to individual subdomains (e.g., `roast.nalakara.com`).
* **The Solution-Seeker**: Arrives looking for a specific utility (e.g., Beauty Batch OS), quickly identifies its status (e.g., available commercial product), and is guided to its dedicated standalone interface or checkout screen.
* **The Inquirer**: Seeks to understand the "why" behind the studio, navigating to the core philosophy and contact coordinates.

### Ecosystem Role vs. Commercial Role
* **Ecosystem Role**: A transparent chronicle of ideas moving through stages of development. It validates the "foundry" concept by exposing active, experimental, and archived projects.
* **Commercial Role**: A clean gateway to monetize matured products without cluttering the homepage with a generic, transactional ecommerce storefront.

> **Coexistence Strategy**: We balance this tension by organizing content around a lifecycle model (**Idea → Lab → Project → Product → Commercial**). The homepage acts as a curation engine showing the latest updates from the foundry, while a dedicated "Utility/Shop" filter or secondary page acts as the clean catalog for things people can immediately use or buy.

### What the Website Should NOT Become
* **A Static Portfolio**: It must not feel like a frozen archive of completed work.
* **A Generic AI/SaaS Startup Landing Page**: Avoid landing page templates featuring generic dashboards, standard features matrices, and buzzword-heavy copy.
* **A Cluttered Ecommerce Shop**: It should not look like a Shopify template selling random goods.

### Initial MVP Scope
A single-page or simple multi-page static site that introduces the Nalakara ecosystem, showcases the initial roster of projects/products (categorized by lifecycle stage), and explains the core philosophy.

### Future Expansion Possibilities
* Integration of a lightweight Headless CMS (e.g., MDX or Decap CMS) for log publishing.
* Integration of simple payment/checkout redirects (Stripe, Lemon Squeezy).
* Deep metadata syncing with product subdomains via serverless APIs.

---

## 2. Information Architecture (IA) Proposal

For the **v1 MVP**, we recommend a highly focused, single-page-first structure with clean section targeting, ensuring minimum friction and high typography impact.

* **Home (Ecosystem Landing)**
  * **Hero**: Clear statement of identity ("A studio and foundry that turns ideas into useful things").
  * **Live Stream / Status Board**: A real-time-like summary of what is currently being built, used, and bought.
* **The Foundry (Projects & Labs)**
  * Filterable gallery displaying cards representing active initiatives.
  * Status badges clearly separating: *Idea*, *Lab*, *Project*, *Product*, *Commercial*.
* **Philosophy / About**
  * Concise statement of principles (e.g., utility, domain independence, craft).
* **Footer / Registry**
  * Direct links to standalone product surfaces (e.g., `bros.nalakara.com`, `roast.nalakara.com`) and contact options.

*Future Scope (v2+)*:
* Individual detail pages for projects requiring extensive case-study layout.
* Integrated Blog / Lab Logs section.

---

## 3. Content Model Proposal

To allow items to evolve from ideas to commercialized products, we define a unified schema. This schema can live in local JSON/MDX files for v1, making it trivial to port to a database or CMS later.

```typescript
interface EcosystemItem {
  id: string;              // Unique identifier (e.g., "roast-navigator")
  name: string;            // Display name
  tagline: string;         // Short, high-impact description
  description: string;     // Detailed body copy (supports markdown)
  
  // Lifecycle Phase
  status: 'idea' | 'lab' | 'project' | 'product' | 'commercial';
  
  // Categorization
  category: 'software' | 'digital' | 'physical' | 'service' | 'experimental';
  
  // Visual assets
  visualUrl?: string;      // Thumbnail or structural schematic image
  
  // Connectivity
  targetUrl?: string;      // Link to subdomain or external destination (if launched)
  
  // Metadata for Commercial Phase
  pricing?: {
    model: 'free' | 'one-time' | 'subscription';
    priceFormatted?: string;
  };
  
  featured: boolean;       // To highlight on the main ecosystem overview
  updatedAt: string;       // ISO timestamp for sorting
}
```

---

## 4. Architecture Review

### Recommended Stack
* **Framework**: **Next.js (App Router)** or **Vite**. Given Vercel is the target deployment platform and future SEO/static optimization is important, **Next.js (Static Export or ISR)** is the ideal choice. It allows us to start with simple static files and transition to dynamic features (CMS, API endpoints) without switching frameworks.
* **Styling**: **Vanilla CSS** (using modern CSS variables, Grid, and Flexbox) to maintain full creative control, ensuring a distinctive, custom studio feel without generic Tailwind signatures.
* **Content Management**: Local **MDX** or **JSON** files stored in the repository. This keeps setup cost to zero, maintains performance, and version-controls the content alongside the code.
* **Hosting / Deployment**: **Vercel** with automatic deployment triggered by GitHub pushes.

### Rendering Strategy
* **Static Generation (SSG)**: Excellent for fast loading speeds, clean lighthouse scores, and Vercel hosting efficiency.

---

## 5. MVP Scope Definition

| MUST HAVE (v1) | SHOULD HAVE (v1.5) | FUTURE (v2+) |
| :--- | :--- | :--- |
| Core landing layout with premium, restrained typography | Interactive filter (All / Labs / Products) | Dynamic blog / logs backend |
| Standardized content data file (JSON/MDX) | Hover previews and micro-interactions | Direct checkout integration |
| Visual status indicators (Idea → Commercial) | Project details page/modals | Live activity feed API |
| Direct links to active project subdomains | Dark/Light mode toggle | Multi-author CMS support |

---

## 6. Risks / Open Questions

1. **Brand Identity Separation**: How distinct will the visual styling of nalakara.com be relative to its subdomains? (Recommendation: Keep nalakara.com highly monochromatic and structurally raw, allowing target subdomains to inject their own vibrant color profiles.)
2. **Subdomain Infrastructure**: Will subdomains share Vercel project instances, or will they be independent deployments? (Recommendation: Deploy them as separate Vercel projects pointing to the same apex domain DNS config.)

---

## 7. Recommended Next Step

1. **Approve this Discovery & Architecture Review.**
2. Initialize a minimal Next.js or Vite environment inside this directory.
3. Configure the typography foundation, basic layout structure, and mock JSON dataset based on the content model.

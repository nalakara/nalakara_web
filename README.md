# Nalakara.com (v1)

> **"A studio and foundry that turns ideas into useful things."**

**Nalakara.com** is the parent ecosystem entry point, registry, and discovery layer for Nalakara. It unifies disparate initiatives across software, physical instruments, digital systems, and studio services under a disciplined lifecycle model.

---

## 🏛️ Ecosystem Model

Every initiative in Nalakara evolves through 5 distinct lifecycle stages:

```
01 Idea  ──►  02 Lab  ──►  03 Project  ──►  04 Product  ──►  05 Commercial
```

* **Idea**: Conceptual draft or architectural thesis.
* **Lab**: Active experiment or laboratory prototype.
* **Project**: Operational tool or cohesive system under active development.
* **Product**: Mature, stable utility ready for public end-user adoption.
* **Commercial**: Production license, commercial platform, or paid offering.

---

## 🚀 Active Initiatives

* **[B.R.O.S.](https://bros.nalakara.com)** (`Project`) — Autonomous operations and system intelligence framework.
* **[Roast Navigator](https://roast.nalakara.com)** (`Product`) — Precision sensory and roast curve intelligence for specialty coffee.
* **[Beauty Batch OS](https://beauty.nalakara.com)** (`Commercial`) — Formulation, batch compliance, and inventory management system for cosmetic compounding.
* **Nalakara Skill Factory** (`Lab`) — Modular agent skill synthesis and capability training pipeline.

---

## 🛠️ Architecture & Tech Stack

* **Framework**: [Next.js 15+ (App Router)](https://nextjs.org/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: Vanilla CSS Modules with custom CSS tokens (No heavy UI frameworks)
* **Data Layer**: Static TypeScript data (`src/data/ecosystem.ts`)
* **Deployment**: [Vercel](https://vercel.com)

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📁 Directory Structure

```
/
├── public/                # Static assets, favicon, robots.txt
├── src/
│   ├── app/               # Next.js App Router (layout, page, global css)
│   ├── components/        # Header, Hero, Initiatives, Registry, Philosophy, Footer
│   ├── data/              # Static ecosystem datasets
│   └── types/             # TypeScript type definitions
├── package.json
└── tsconfig.json
```

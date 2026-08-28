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
    targetUrl: undefined,
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
    status: 'project',
    category: 'digital-system',
    accessModel: 'private-alpha',
    targetUrl: undefined,
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
    status: 'project',
    category: 'software',
    accessModel: 'private-alpha',
    targetUrl: undefined,
    isExternal: false,
    featured: true,
    commercial: {
      pricingType: 'custom',
      badgeLabel: 'Commercial Candidate'
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

export const STUDIO_PRINCIPLES = [
  {
    number: '01',
    title: 'Domain Independence',
    description: 'Ideas are not restricted to a single industrial or technological vertical. We apply systemic thinking across digital software, physical instruments, and operational frameworks.'
  },
  {
    number: '02',
    title: 'Utility Over Novelty',
    description: 'We do not build purely decorative demonstrations. Every artifact originating from the foundry must perform real, verifiable work and solve concrete problems.'
  },
  {
    number: '03',
    title: 'Autonomous Product Identity',
    description: 'Individual initiatives earn their own dedicated visual identities, distinct subdomains, and tailored user experiences rather than being forced into a uniform corporate template.'
  },
  {
    number: '04',
    title: 'Disciplined Lifecycle Evolution',
    description: 'Initiatives graduate deliberately through five verifiable states: Idea → Lab → Project → Product → Commercial. Progression requires stability, utility, and real-world validation.'
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

export type LifecycleStatus = 'idea' | 'lab' | 'project' | 'product' | 'commercial';

export type InitiativeCategory =
  | 'software'
  | 'digital-system'
  | 'physical-good'
  | 'service'
  | 'experimental';

export type AccessModel =
  | 'concept'
  | 'private-alpha'
  | 'public-beta'
  | 'production'
  | 'commercial';

export interface CommercialMetadata {
  pricingType: 'free' | 'one-time' | 'subscription' | 'custom';
  badgeLabel?: string;
  actionLabel?: string;
}

export interface EcosystemItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: LifecycleStatus;
  category: InitiativeCategory;
  accessModel: AccessModel;
  targetUrl?: string;
  isExternal: boolean;
  featured: boolean;
  order: number;
  updatedAt: string;
  commercial?: CommercialMetadata;
}

export type RegistryFilter = 'all' | 'building' | 'usable' | 'commercial';

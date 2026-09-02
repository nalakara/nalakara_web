export type Language = 'en' | 'id';

export interface LocalizedString {
  en: string;
  id: string;
}

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
  badgeLabel?: LocalizedString;
  actionLabel?: LocalizedString;
}

export type CoverMediaType = 'image' | 'video';

export interface CoverMedia {
  type: CoverMediaType;
  url: string;
  focalPosition?: string; // e.g. 'center', 'top', 'bottom'
  posterUrl?: string;     // poster fallback for video
}

export interface EcosystemItem {
  id: string;
  name: string;
  tagline: LocalizedString;
  description: LocalizedString;
  status: LifecycleStatus;
  category: InitiativeCategory;
  accessModel: AccessModel;
  targetUrl?: string;
  isExternal: boolean;
  featured: boolean;
  order: number;
  updatedAt: string;
  commercial?: CommercialMetadata;
  coverMedia?: CoverMedia;
  isDraft?: boolean;
}

export interface StudioPrinciple {
  number: string;
  title: LocalizedString;
  description: LocalizedString;
  isDraft?: boolean;
}

export interface PreviewHeroConfig {
  mode: 'studio' | 'featured_initiative';
  featuredItem?: EcosystemItem | null;
  showLifecycleBar: boolean;
}

export type RegistryFilter = 'all' | 'building' | 'usable' | 'commercial';


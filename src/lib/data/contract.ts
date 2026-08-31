import { EcosystemItem, StudioPrinciple, PreviewHeroConfig } from '@/types';

/**
 * PHASE 5 CANONICAL DATA ACCESS CONTRACT
 *
 * This contract defines the exact interface and requirements that Phase 5
 * will consume when connecting the public homepage (/) to the cached Supabase layer.
 *
 * Invariants:
 * 1. Public Predicate: Only rows where publication_status = 'published' are retrieved.
 * 2. Draft Isolation: Drafts are physically filtered at the query layer.
 * 3. Cache Boundary: Data returned here will be cached with tags defined in CACHE_TAGS.
 * 4. Fallback Safety: In case of transient connection errors, fallback to local static data.
 */

export interface PublicEcosystemPayload {
  initiatives: EcosystemItem[];
  featuredInitiatives: EcosystemItem[];
  principles: StudioPrinciple[];
  heroConfig: PreviewHeroConfig;
  source: 'database' | 'static-fallback';
  generatedAt: string;
}

export const PUBLIC_DATA_REQUIREMENTS = {
  PREDICATE_INITIATIVES: "publication_status = 'published'",
  PREDICATE_CATEGORIES: "is_active = true",
  PREDICATE_PRINCIPLES: "publication_status = 'published'",
  PRIMARY_HERO_ID: 'primary',
} as const;

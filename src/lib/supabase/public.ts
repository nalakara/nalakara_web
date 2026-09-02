import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { CACHE_TAGS } from '@/lib/cache/revalidate';
import { EcosystemItem, StudioPrinciple, PreviewHeroConfig, LifecycleStatus, InitiativeCategory, AccessModel } from '@/types';
import { Database } from '@/types/database';
import { ECOSYSTEM_INITIATIVES, STUDIO_PRINCIPLES } from '@/data/ecosystem';

export interface PublicEcosystemPayload {
  initiatives: EcosystemItem[];
  featuredInitiatives: EcosystemItem[];
  principles: StudioPrinciple[];
  heroConfig: PreviewHeroConfig;
  source: 'database' | 'static-fallback';
  generatedAt: string;
}

/**
 * Creates an anonymous, public Supabase client specifically for server-side public fetching.
 * Uses public ANON key only. Never touches service role key.
 */
function createPublicSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase public credentials missing.');
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Maps raw initiatives row to public EcosystemItem.
 */
function mapInitiativeToPublicItem(
  row: Database['public']['Tables']['initiatives']['Row']
): EcosystemItem {
  const commercial =
    row.commercial_badge_en || row.commercial_badge_id || row.commercial_action_en || row.commercial_action_id
      ? {
          pricingType: 'custom' as const,
          badgeLabel:
            row.commercial_badge_en || row.commercial_badge_id
              ? {
                  en: row.commercial_badge_en || '',
                  id: row.commercial_badge_id || '',
                }
              : undefined,
          actionLabel:
            row.commercial_action_en || row.commercial_action_id
              ? {
                  en: row.commercial_action_en || '',
                  id: row.commercial_action_id || '',
                }
              : undefined,
        }
      : undefined;

  const coverMedia =
    row.cover_media_url && (row.cover_media_type === 'image' || row.cover_media_type === 'video')
      ? {
          type: row.cover_media_type as 'image' | 'video',
          url: row.cover_media_url,
          focalPosition: row.cover_media_focal || 'center',
          posterUrl: row.cover_media_poster || undefined,
        }
      : undefined;

  return {
    id: row.id,
    name: row.name,
    tagline: {
      en: row.tagline_en || '',
      id: row.tagline_id || '',
    },
    description: {
      en: row.description_en || '',
      id: row.description_id || '',
    },
    status: row.lifecycle_stage as LifecycleStatus,
    category: row.category_id as InitiativeCategory,
    accessModel: row.access_model as AccessModel,
    targetUrl: row.target_url || undefined,
    isExternal: Boolean(row.is_external),
    featured: Boolean(row.featured),
    order: row.sort_order,
    updatedAt: row.updated_at ? row.updated_at.split('T')[0] : '2026-08-30',
    commercial,
    coverMedia,
    isDraft: false, // Public items are strictly published
  };
}

/**
 * Maps raw principle row to public StudioPrinciple.
 */
function mapPrincipleToPublicPrinciple(
  row: Database['public']['Tables']['studio_principles']['Row']
): StudioPrinciple {
  return {
    number: row.number,
    title: {
      en: row.title_en,
      id: row.title_id,
    },
    description: {
      en: row.description_en,
      id: row.description_id,
    },
    isDraft: false,
  };
}

/**
 * Internal raw fetcher for public ecosystem data with refined fallback semantics.
 */
export async function fetchRawPublicEcosystemData(): Promise<PublicEcosystemPayload> {
  // Allow explicit testing/debug override
  if (process.env.PUBLIC_FORCE_STATIC_FALLBACK === 'true') {
    return getStaticFallbackPayload('Forced static fallback via environment variable');
  }

  try {
    const supabase = createPublicSupabaseClient();

    // Query strictly published items and active categories concurrently
    const [initiativesRes, heroConfigRes, principlesRes, categoriesRes] = await Promise.all([
      supabase
        .from('initiatives')
        .select('*')
        .eq('publication_status', 'published')
        .order('sort_order', { ascending: true }),
      supabase
        .from('hero_config')
        .select('*')
        .eq('id', 'primary')
        .maybeSingle(),
      supabase
        .from('studio_principles')
        .select('*')
        .eq('publication_status', 'published')
        .order('sort_order', { ascending: true }),
      supabase
        .from('categories')
        .select('id')
        .eq('is_active', true),
    ]);

    // Check for hard database errors
    if (initiativesRes.error) throw new Error(`Initiatives query error: ${initiativesRes.error.message}`);
    if (heroConfigRes.error) throw new Error(`Hero query error: ${heroConfigRes.error.message}`);
    if (principlesRes.error) throw new Error(`Principles query error: ${principlesRes.error.message}`);
    if (categoriesRes.error) throw new Error(`Categories query error: ${categoriesRes.error.message}`);

    const rawInitiatives = initiativesRes.data || [];
    const rawPrinciples = principlesRes.data || [];
    const rawHeroConfig = heroConfigRes.data;
    const activeCategoryIds = new Set((categoriesRes.data || []).map((c) => c.id));

    // Filter initiatives to only include those belonging to active categories
    const validInitiatives = rawInitiatives.filter((item) => activeCategoryIds.has(item.category_id));

    const initiatives: EcosystemItem[] = validInitiatives.map(mapInitiativeToPublicItem);
    const featuredInitiatives: EcosystemItem[] = initiatives.filter((item) => item.featured);
    const principles: StudioPrinciple[] = rawPrinciples.map(mapPrincipleToPublicPrinciple);

    let featuredItem: EcosystemItem | null = null;
    if (rawHeroConfig?.mode === 'featured_initiative' && rawHeroConfig.featured_initiative_id) {
      featuredItem = initiatives.find((i) => i.id === rawHeroConfig.featured_initiative_id) || null;
    }

    const heroConfig: PreviewHeroConfig = {
      mode: rawHeroConfig?.mode === 'featured_initiative' ? 'featured_initiative' : 'studio',
      featuredItem,
      showLifecycleBar: rawHeroConfig ? Boolean(rawHeroConfig.show_lifecycle_bar) : true,
    };

    return {
      initiatives,
      featuredInitiatives,
      principles,
      heroConfig,
      source: 'database',
      generatedAt: new Date().toISOString(),
    };
  } catch (err: any) {
    console.error('[Public DAL] Database fetch failure, switching to static fallback:', err?.message || err);
    return getStaticFallbackPayload(err?.message || 'Database connection error');
  }
}

/**
 * Returns clean in-memory fallback payload.
 */
function getStaticFallbackPayload(reason: string): PublicEcosystemPayload {
  const featured = ECOSYSTEM_INITIATIVES.filter((i) => i.featured);
  return {
    initiatives: ECOSYSTEM_INITIATIVES,
    featuredInitiatives: featured,
    principles: STUDIO_PRINCIPLES,
    heroConfig: {
      mode: 'studio',
      featuredItem: null,
      showLifecycleBar: true,
    },
    source: 'static-fallback',
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Cached public DAL function.
 * Wraps raw database fetcher in Next.js unstable_cache with tag 'ecosystem'.
 */
export const getPublicEcosystemData = unstable_cache(
  async (): Promise<PublicEcosystemPayload> => {
    return fetchRawPublicEcosystemData();
  },
  ['public-ecosystem-cache'],
  {
    tags: [CACHE_TAGS.ECOSYSTEM],
    revalidate: false, // On-demand only via revalidateTag('ecosystem')
  }
);

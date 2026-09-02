import { createClient } from '@/lib/supabase/server';
import { EcosystemItem, StudioPrinciple, PreviewHeroConfig, LifecycleStatus, InitiativeCategory, AccessModel } from '@/types';
import { Database } from '@/types/database';

export interface PreviewData {
  initiatives: EcosystemItem[];
  featuredInitiatives: EcosystemItem[];
  principles: StudioPrinciple[];
  heroConfig: PreviewHeroConfig;
  draftCount: number;
  publishedCount: number;
}

/**
 * Maps Supabase raw database records into standard public EcosystemItem format,
 * attaching the isDraft decorator for drafts.
 */
function mapInitiativeToEcosystemItem(
  row: Database['public']['Tables']['initiatives']['Row']
): EcosystemItem {
  const isDraft = row.publication_status === 'draft';

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
    isDraft,
  };
}

/**
 * Maps Supabase raw database records into standard public StudioPrinciple format.
 */
function mapPrincipleToStudioPrinciple(
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
    isDraft: row.publication_status === 'draft',
  };
}

/**
 * Fetches all live & draft state from Supabase for the authenticated /admin/preview route.
 * Excludes archived items so preview matches exact live expectations.
 */
export async function getPreviewData(customClient?: any): Promise<PreviewData> {
  let supabase = customClient;

  if (!supabase) {
    const isDevBypass =
      process.env.NODE_ENV === 'development' &&
      process.env.ADMIN_DEV_BYPASS === 'true';

    if (isDevBypass) {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      supabase = createAdminClient();
    } else {
      supabase = await createClient();
    }
  }

  // Fetch all content domains concurrently
  const [initiativesRes, heroConfigRes, principlesRes] = await Promise.all([
    supabase
      .from('initiatives')
      .select('*')
      .neq('publication_status', 'archived')
      .order('sort_order', { ascending: true }),
    supabase
      .from('hero_config')
      .select('*')
      .eq('id', 'primary')
      .single(),
    supabase
      .from('studio_principles')
      .select('*')
      .neq('publication_status', 'archived')
      .order('sort_order', { ascending: true }),
  ]);

  const rawInitiatives = (initiativesRes.data || []) as Database['public']['Tables']['initiatives']['Row'][];
  const rawPrinciples = (principlesRes.data || []) as Database['public']['Tables']['studio_principles']['Row'][];
  const rawHeroConfig = heroConfigRes.data as Database['public']['Tables']['hero_config']['Row'] | null;

  const initiatives: EcosystemItem[] = rawInitiatives.map(mapInitiativeToEcosystemItem);
  const featuredInitiatives: EcosystemItem[] = initiatives.filter((item: EcosystemItem) => item.featured);
  const principles: StudioPrinciple[] = rawPrinciples.map(mapPrincipleToStudioPrinciple);

  const draftCount = initiatives.filter((i: EcosystemItem) => i.isDraft).length + principles.filter((p: StudioPrinciple) => p.isDraft).length;
  const publishedCount = initiatives.filter((i: EcosystemItem) => !i.isDraft).length + principles.filter((p: StudioPrinciple) => !p.isDraft).length;

  let featuredItem: EcosystemItem | null = null;
  if (rawHeroConfig?.mode === 'featured_initiative' && rawHeroConfig.featured_initiative_id) {
    featuredItem =
      initiatives.find((i: EcosystemItem) => i.id === rawHeroConfig.featured_initiative_id) || null;
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
    draftCount,
    publishedCount,
  };
}

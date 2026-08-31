'use server';

import { createClient } from '@/lib/supabase/server';
import { LifecycleStage, AccessModel, PublicationStatus } from '@/types/database';
import { revalidateEcosystemCache } from '@/lib/cache/revalidate';
import { formatSlug } from './utils';

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
}

const VALID_LIFECYCLE_STAGES: LifecycleStage[] = ['idea', 'lab', 'project', 'product', 'commercial'];
const VALID_ACCESS_MODELS: AccessModel[] = ['concept', 'private-alpha', 'public-beta', 'production', 'commercial'];

/**
 * Server-side authorization check enforcing authenticated owner session
 * against the admin_users allowlist.
 */
async function verifyOwner() {
  try {
    const isDevBypass =
      process.env.NODE_ENV === 'development' &&
      process.env.ADMIN_DEV_BYPASS === 'true';

    if (isDevBypass) {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      return {
        authorized: true,
        error: null,
        supabase,
        user: { id: 'dev-bypass-owner', email: 'owner@nalakara.com' } as any,
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { authorized: false, error: 'Unauthorized: Owner authentication required.', supabase: null, user: null };
    }

    const { data: adminUser, error: adminErr } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (adminErr || !adminUser) {
      return { authorized: false, error: 'Forbidden: User is not registered in the owner allowlist.', supabase: null, user };
    }

    return { authorized: true, error: null, supabase, user };
  } catch (err: any) {
    return {
      authorized: false,
      error: `Unauthorized: ${err?.message || 'Valid owner session required.'}`,
      supabase: null,
      user: null,
    };
  }
}

/**
 * Validates common metadata fields.
 */
function validateMetadata(
  name: string,
  slug: string,
  categoryId: string,
  lifecycle: string,
  accessModel: string,
  sortOrderStr: string,
  targetUrl: string | null
): { errors: Record<string, string>; sortOrder: number } {
  const errors: Record<string, string> = {};

  if (!name || name.trim().length === 0) {
    errors.name = 'Initiative name is required.';
  } else if (name.length > 64) {
    errors.name = 'Name must be 64 characters or fewer.';
  }

  if (!slug || slug.trim().length === 0) {
    errors.slug = 'Slug is required.';
  } else if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens.';
  } else if (slug.length > 64) {
    errors.slug = 'Slug must be 64 characters or fewer.';
  }

  if (!categoryId || categoryId.trim().length === 0) {
    errors.category_id = 'Category is required.';
  }

  if (!VALID_LIFECYCLE_STAGES.includes(lifecycle as LifecycleStage)) {
    errors.lifecycle_stage = 'Invalid lifecycle stage.';
  }

  if (!VALID_ACCESS_MODELS.includes(accessModel as AccessModel)) {
    errors.access_model = 'Invalid access model.';
  }

  let sortOrder = 0;
  if (sortOrderStr) {
    const parsed = parseInt(sortOrderStr, 10);
    if (isNaN(parsed) || parsed < 0) {
      errors.sort_order = 'Sort order must be a non-negative integer.';
    } else {
      sortOrder = parsed;
    }
  }

  if (targetUrl && targetUrl.trim().length > 0) {
    if (targetUrl.length > 255) {
      errors.target_url = 'Target URL must be 255 characters or fewer.';
    }
  }

  return { errors, sortOrder };
}

/**
 * CREATE INITIATIVE ACTION
 * Default status: 'draft'
 */
export async function createInitiativeAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const auth = await verifyOwner();
  if (!auth.authorized || !auth.supabase) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  const name = (formData.get('name') as string || '').trim();
  const rawSlug = (formData.get('slug') as string || '').trim();
  const slug = rawSlug ? formatSlug(rawSlug) : formatSlug(name);
  const id = slug; // Deterministic ID matching slug

  const categoryId = (formData.get('category_id') as string || '').trim();
  const lifecycleStage = (formData.get('lifecycle_stage') as LifecycleStage) || 'idea';
  const accessModel = (formData.get('access_model') as AccessModel) || 'concept';
  const sortOrderStr = formData.get('sort_order') as string;
  const targetUrl = (formData.get('target_url') as string || '').trim() || null;
  const isExternal = formData.get('is_external') === 'true' || formData.get('is_external') === 'on';
  const featured = formData.get('featured') === 'true' || formData.get('featured') === 'on';

  const taglineEn = (formData.get('tagline_en') as string || '').trim().slice(0, 140);
  const taglineId = (formData.get('tagline_id') as string || '').trim().slice(0, 140);
  const descriptionEn = (formData.get('description_en') as string || '').trim().slice(0, 320);
  const descriptionId = (formData.get('description_id') as string || '').trim().slice(0, 320);

  const commercialBadgeEn = (formData.get('commercial_badge_en') as string || '').trim().slice(0, 40) || null;
  const commercialBadgeId = (formData.get('commercial_badge_id') as string || '').trim().slice(0, 40) || null;
  const commercialActionEn = (formData.get('commercial_action_en') as string || '').trim().slice(0, 40) || null;
  const commercialActionId = (formData.get('commercial_action_id') as string || '').trim().slice(0, 40) || null;

  const { errors, sortOrder } = validateMetadata(
    name,
    slug,
    categoryId,
    lifecycleStage,
    accessModel,
    sortOrderStr,
    targetUrl
  );

  if (Object.keys(errors).length > 0) {
    return { success: false, error: 'Validation failed. Please review the highlighted fields.', fieldErrors: errors };
  }

  // Check category validity in database
  const { data: category } = await auth.supabase
    .from('categories')
    .select('id')
    .eq('id', categoryId)
    .single();

  if (!category) {
    return { success: false, error: 'The selected category does not exist in the taxonomy database.', fieldErrors: { category_id: 'Invalid category.' } };
  }

  // Check slug & ID uniqueness
  const { data: existing } = await auth.supabase
    .from('initiatives')
    .select('id, slug')
    .or(`id.eq.${id},slug.eq.${slug}`)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: `An initiative with slug '${slug}' already exists. Please choose a distinct identifier.`,
      fieldErrors: { slug: 'Slug is already in use.' },
    };
  }

  const insertPayload = {
    id,
    slug,
    name,
    category_id: categoryId,
    lifecycle_stage: lifecycleStage,
    access_model: accessModel,
    tagline_en: taglineEn,
    tagline_id: taglineId,
    description_en: descriptionEn,
    description_id: descriptionId,
    target_url: targetUrl,
    is_external: isExternal,
    featured,
    sort_order: sortOrder,
    publication_status: 'draft' as PublicationStatus,
    commercial_badge_en: commercialBadgeEn,
    commercial_badge_id: commercialBadgeId,
    commercial_action_en: commercialActionEn,
    commercial_action_id: commercialActionId,
    published_at: null,
  };

  const { error: insertErr } = await auth.supabase.from('initiatives').insert(insertPayload);

  if (insertErr) {
    return { success: false, error: `Failed to create initiative in database: ${insertErr.message}` };
  }

  revalidateEcosystemCache({ domain: 'initiatives', id });

  return { success: true, data: { id } };
}

/**
 * UPDATE INITIATIVE DRAFT ACTION
 * Preserves publication_status (or maintains draft/archived).
 */
export async function updateInitiativeDraftAction(id: string, formData: FormData): Promise<ActionResult> {
  const auth = await verifyOwner();
  if (!auth.authorized || !auth.supabase) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  // Fetch existing initiative to verify existence
  const { data: currentItem, error: fetchErr } = await auth.supabase
    .from('initiatives')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchErr || !currentItem) {
    return { success: false, error: 'Initiative not found in database.' };
  }

  const name = (formData.get('name') as string || '').trim();
  const slug = (formData.get('slug') as string || currentItem.slug).trim();
  const categoryId = (formData.get('category_id') as string || '').trim();
  const lifecycleStage = (formData.get('lifecycle_stage') as LifecycleStage) || currentItem.lifecycle_stage;
  const accessModel = (formData.get('access_model') as AccessModel) || currentItem.access_model;
  const sortOrderStr = formData.get('sort_order') as string;
  const targetUrl = (formData.get('target_url') as string || '').trim() || null;
  const isExternal = formData.get('is_external') === 'true' || formData.get('is_external') === 'on';
  const featured = formData.get('featured') === 'true' || formData.get('featured') === 'on';

  const taglineEn = (formData.get('tagline_en') as string || '').trim().slice(0, 140);
  const taglineId = (formData.get('tagline_id') as string || '').trim().slice(0, 140);
  const descriptionEn = (formData.get('description_en') as string || '').trim().slice(0, 320);
  const descriptionId = (formData.get('description_id') as string || '').trim().slice(0, 320);

  const commercialBadgeEn = (formData.get('commercial_badge_en') as string || '').trim().slice(0, 40) || null;
  const commercialBadgeId = (formData.get('commercial_badge_id') as string || '').trim().slice(0, 40) || null;
  const commercialActionEn = (formData.get('commercial_action_en') as string || '').trim().slice(0, 40) || null;
  const commercialActionId = (formData.get('commercial_action_id') as string || '').trim().slice(0, 40) || null;

  const { errors, sortOrder } = validateMetadata(
    name,
    slug,
    categoryId,
    lifecycleStage,
    accessModel,
    sortOrderStr,
    targetUrl
  );

  if (Object.keys(errors).length > 0) {
    return { success: false, error: 'Validation failed. Please review the highlighted fields.', fieldErrors: errors };
  }

  // If slug was changed, check for conflict with other rows
  if (slug !== currentItem.slug) {
    const { data: conflict } = await auth.supabase
      .from('initiatives')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .maybeSingle();

    if (conflict) {
      return { success: false, error: `Slug '${slug}' is already used by another initiative.`, fieldErrors: { slug: 'Slug conflict.' } };
    }
  }

  const updatePayload = {
    slug,
    name,
    category_id: categoryId,
    lifecycle_stage: lifecycleStage,
    access_model: accessModel,
    tagline_en: taglineEn,
    tagline_id: taglineId,
    description_en: descriptionEn,
    description_id: descriptionId,
    target_url: targetUrl,
    is_external: isExternal,
    featured,
    sort_order: sortOrder,
    commercial_badge_en: commercialBadgeEn,
    commercial_badge_id: commercialBadgeId,
    commercial_action_en: commercialActionEn,
    commercial_action_id: commercialActionId,
  };

  const { error: updateErr } = await auth.supabase
    .from('initiatives')
    .update(updatePayload)
    .eq('id', id);

  if (updateErr) {
    return { success: false, error: `Failed to save draft: ${updateErr.message}` };
  }

  revalidateEcosystemCache({ domain: 'initiatives', id });

  return { success: true };
}

/**
 * PUBLISH INITIATIVE ACTION
 * Validates complete bilingual content and sets publication_status = 'published'.
 */
export async function publishInitiativeAction(id: string, formData: FormData): Promise<ActionResult> {
  const auth = await verifyOwner();
  if (!auth.authorized || !auth.supabase) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  const { data: currentItem, error: fetchErr } = await auth.supabase
    .from('initiatives')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchErr || !currentItem) {
    return { success: false, error: 'Initiative not found in database.' };
  }

  const name = (formData.get('name') as string || '').trim();
  const slug = (formData.get('slug') as string || currentItem.slug).trim();
  const categoryId = (formData.get('category_id') as string || '').trim();
  const lifecycleStage = (formData.get('lifecycle_stage') as LifecycleStage) || currentItem.lifecycle_stage;
  const accessModel = (formData.get('access_model') as AccessModel) || currentItem.access_model;
  const sortOrderStr = formData.get('sort_order') as string;
  const targetUrl = (formData.get('target_url') as string || '').trim() || null;
  const isExternal = formData.get('is_external') === 'true' || formData.get('is_external') === 'on';
  const featured = formData.get('featured') === 'true' || formData.get('featured') === 'on';

  const taglineEn = (formData.get('tagline_en') as string || '').trim().slice(0, 140);
  const taglineId = (formData.get('tagline_id') as string || '').trim().slice(0, 140);
  const descriptionEn = (formData.get('description_en') as string || '').trim().slice(0, 320);
  const descriptionId = (formData.get('description_id') as string || '').trim().slice(0, 320);

  const commercialBadgeEn = (formData.get('commercial_badge_en') as string || '').trim().slice(0, 40) || null;
  const commercialBadgeId = (formData.get('commercial_badge_id') as string || '').trim().slice(0, 40) || null;
  const commercialActionEn = (formData.get('commercial_action_en') as string || '').trim().slice(0, 40) || null;
  const commercialActionId = (formData.get('commercial_action_id') as string || '').trim().slice(0, 40) || null;

  const { errors: baseErrors, sortOrder } = validateMetadata(
    name,
    slug,
    categoryId,
    lifecycleStage,
    accessModel,
    sortOrderStr,
    targetUrl
  );

  const fieldErrors: Record<string, string> = { ...baseErrors };
  const missingRequiredList: string[] = [];

  if (!name || name.trim().length === 0) {
    missingRequiredList.push('Initiative Name');
  }
  if (!slug || slug.trim().length === 0) {
    missingRequiredList.push('Slug Identifier');
  }
  if (!categoryId || categoryId.trim().length === 0) {
    missingRequiredList.push('Category');
  }

  // Strict bilingual required fields validation (must be non-empty, non-whitespace strings)
  if (!taglineEn || taglineEn.trim().length === 0) {
    fieldErrors.tagline_en = 'English tagline is required for publication.';
    missingRequiredList.push('English Tagline');
  }
  if (!taglineId || taglineId.trim().length === 0) {
    fieldErrors.tagline_id = 'Indonesian tagline is required for publication.';
    missingRequiredList.push('Indonesian Tagline');
  }
  if (!descriptionEn || descriptionEn.trim().length === 0) {
    fieldErrors.description_en = 'English description is required for publication.';
    missingRequiredList.push('English Description');
  }
  if (!descriptionId || descriptionId.trim().length === 0) {
    fieldErrors.description_id = 'Indonesian description is required for publication.';
    missingRequiredList.push('Indonesian Description');
  }

  // Commercial fields are purely OPTIONAL and do NOT block publishing if empty.
  // If one language is partially filled while the other is missing, flag pairing.
  if ((commercialBadgeEn && !commercialBadgeId) || (!commercialBadgeEn && commercialBadgeId)) {
    fieldErrors.commercial_badge_en = 'Both English and Indonesian commercial badges must be provided together if used.';
    fieldErrors.commercial_badge_id = 'Both English and Indonesian commercial badges must be provided together if used.';
  }
  if ((commercialActionEn && !commercialActionId) || (!commercialActionEn && commercialActionId)) {
    fieldErrors.commercial_action_en = 'Both English and Indonesian commercial actions must be provided together if used.';
    fieldErrors.commercial_action_id = 'Both English and Indonesian commercial actions must be provided together if used.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    const errorSummary =
      missingRequiredList.length > 0
        ? `Cannot publish: Missing required field(s): ${missingRequiredList.join(', ')}.`
        : 'Cannot publish: Please resolve the highlighted validation errors.';

    return {
      success: false,
      error: errorSummary,
      fieldErrors,
    };
  }

  // Retain original published_at or assign current timestamp on first publish
  const publishedAt = currentItem.published_at || new Date().toISOString();

  const updatePayload = {
    slug,
    name,
    category_id: categoryId,
    lifecycle_stage: lifecycleStage,
    access_model: accessModel,
    tagline_en: taglineEn,
    tagline_id: taglineId,
    description_en: descriptionEn,
    description_id: descriptionId,
    target_url: targetUrl,
    is_external: isExternal,
    featured,
    sort_order: sortOrder,
    publication_status: 'published' as PublicationStatus,
    commercial_badge_en: commercialBadgeEn,
    commercial_badge_id: commercialBadgeId,
    commercial_action_en: commercialActionEn,
    commercial_action_id: commercialActionId,
    published_at: publishedAt,
  };

  const { error: updateErr } = await auth.supabase
    .from('initiatives')
    .update(updatePayload)
    .eq('id', id);

  if (updateErr) {
    return { success: false, error: `Failed to publish initiative: ${updateErr.message}` };
  }

  revalidateEcosystemCache({ domain: 'initiatives', id });

  return { success: true };
}

/**
 * ARCHIVE INITIATIVE ACTION
 * Sets publication_status = 'archived'
 */
export async function archiveInitiativeAction(id: string): Promise<ActionResult> {
  const auth = await verifyOwner();
  if (!auth.authorized || !auth.supabase) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  const { error: updateErr } = await auth.supabase
    .from('initiatives')
    .update({ publication_status: 'archived' as PublicationStatus })
    .eq('id', id);

  if (updateErr) {
    return { success: false, error: `Failed to archive initiative: ${updateErr.message}` };
  }

  revalidateEcosystemCache({ domain: 'initiatives', id });

  return { success: true };
}

/**
 * DELETE INITIATIVE ACTION
 * Permanently removes record with foreign-key constraint protection.
 */
export async function deleteInitiativeAction(id: string): Promise<ActionResult> {
  const auth = await verifyOwner();
  if (!auth.authorized || !auth.supabase) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  const { error: deleteErr } = await auth.supabase
    .from('initiatives')
    .delete()
    .eq('id', id);

  if (deleteErr) {
    if (deleteErr.code === '23503' || deleteErr.message.toLowerCase().includes('foreign key')) {
      return {
        success: false,
        error: `Cannot delete initiative '${id}': It is referenced by another database record. Consider archiving instead.`,
      };
    }
    return { success: false, error: `Failed to delete initiative: ${deleteErr.message}` };
  }

  revalidateEcosystemCache({ domain: 'initiatives', id });

  return { success: true };
}


'use server';

import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database';
import { revalidateEcosystemCache } from '@/lib/cache/revalidate';

type PrincipleInsert = Database['public']['Tables']['studio_principles']['Insert'];
type PrincipleUpdate = Database['public']['Tables']['studio_principles']['Update'];
type PublicationStatus = Database['public']['Enums']['publication_status'];

/**
 * Verifies single-owner authorization boundary.
 */
async function verifyOwner() {
  const isDevBypass =
    process.env.NODE_ENV === 'development' &&
    process.env.ADMIN_DEV_BYPASS === 'true';

  if (isDevBypass) {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    return { supabase: createAdminClient(), isOwner: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { supabase: null, isOwner: false };
  }

  const { data: adminUser, error: allowlistError } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .single();

  if (allowlistError || !adminUser) {
    return { supabase: null, isOwner: false };
  }

  return { supabase, isOwner: true };
}

/**
 * Server Action: Update an existing Studio Principle.
 */
export async function updatePrincipleAction(id: string, formData: FormData) {
  try {
    const { supabase, isOwner } = await verifyOwner();
    if (!isOwner || !supabase) {
      return { success: false, error: 'Unauthorized: Owner session required.' };
    }

    if (!id) {
      return { success: false, error: 'Principle ID is required.' };
    }

    const number = (formData.get('number') as string | null)?.trim() || '';
    const titleEn = (formData.get('title_en') as string | null)?.trim() || '';
    const titleId = (formData.get('title_id') as string | null)?.trim() || '';
    const descriptionEn = (formData.get('description_en') as string | null)?.trim() || '';
    const descriptionId = (formData.get('description_id') as string | null)?.trim() || '';
    const sortOrderRaw = formData.get('sort_order') as string | null;
    const sortOrder = sortOrderRaw ? parseInt(sortOrderRaw, 10) : 0;
    const status = (formData.get('publication_status') as PublicationStatus) || 'published';

    if (!number) {
      return { success: false, error: 'Principle sequence number is required (e.g. 01, 02).' };
    }

    if (!titleEn) {
      return { success: false, error: 'English principle title is required.' };
    }

    if (!titleId) {
      return { success: false, error: 'Indonesian principle title is required.' };
    }

    if (!descriptionEn) {
      return { success: false, error: 'English description is required.' };
    }

    if (!descriptionId) {
      return { success: false, error: 'Indonesian description is required.' };
    }

    const payload: PrincipleUpdate = {
      number,
      title_en: titleEn,
      title_id: titleId,
      description_en: descriptionEn,
      description_id: descriptionId,
      sort_order: isNaN(sortOrder) ? 0 : sortOrder,
      publication_status: status,
    };

    const { error: updateError } = await supabase
      .from('studio_principles')
      .update(payload)
      .eq('id', id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidateEcosystemCache({ domain: 'principles', id });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' };
  }
}

/**
 * Server Action: Create a new Studio Principle.
 */
export async function createPrincipleAction(formData: FormData) {
  try {
    const { supabase, isOwner } = await verifyOwner();
    if (!isOwner || !supabase) {
      return { success: false, error: 'Unauthorized: Owner session required.' };
    }

    const rawId = (formData.get('id') as string | null)?.trim().toLowerCase() || '';
    const number = (formData.get('number') as string | null)?.trim() || '';
    const titleEn = (formData.get('title_en') as string | null)?.trim() || '';
    const titleId = (formData.get('title_id') as string | null)?.trim() || '';
    const descriptionEn = (formData.get('description_en') as string | null)?.trim() || '';
    const descriptionId = (formData.get('description_id') as string | null)?.trim() || '';
    const sortOrderRaw = formData.get('sort_order') as string | null;
    const sortOrder = sortOrderRaw ? parseInt(sortOrderRaw, 10) : 0;
    const status = (formData.get('publication_status') as PublicationStatus) || 'published';

    if (!rawId) {
      return { success: false, error: 'Principle ID is required.' };
    }

    if (!number) {
      return { success: false, error: 'Principle sequence number is required (e.g. 01).' };
    }

    if (!titleEn || !titleId) {
      return { success: false, error: 'Bilingual titles are required.' };
    }

    if (!descriptionEn || !descriptionId) {
      return { success: false, error: 'Bilingual descriptions are required.' };
    }

    const payload: PrincipleInsert = {
      id: rawId,
      number,
      title_en: titleEn,
      title_id: titleId,
      description_en: descriptionEn,
      description_id: descriptionId,
      sort_order: isNaN(sortOrder) ? 0 : sortOrder,
      publication_status: status,
    };

    const { error: insertError } = await supabase
      .from('studio_principles')
      .insert(payload);

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    revalidateEcosystemCache({ domain: 'principles', id: rawId });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' };
  }
}

/**
 * Server Action: Delete a Studio Principle.
 */
export async function deletePrincipleAction(id: string) {
  try {
    const { supabase, isOwner } = await verifyOwner();
    if (!isOwner || !supabase) {
      return { success: false, error: 'Unauthorized: Owner session required.' };
    }

    const { error: deleteError } = await supabase
      .from('studio_principles')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    revalidateEcosystemCache({ domain: 'principles', id });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' };
  }
}


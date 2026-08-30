'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database';

type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

/**
 * Verifies single-owner authorization boundary.
 * In development, honours ADMIN_DEV_BYPASS if explicitly enabled.
 * In production, strictly requires authenticated session in admin_users allowlist.
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
 * Server Action: Create a new category taxonomy.
 */
export async function createCategoryAction(formData: FormData) {
  try {
    const { supabase, isOwner } = await verifyOwner();
    if (!isOwner || !supabase) {
      return { success: false, error: 'Unauthorized: Owner session required.' };
    }

    const rawId = (formData.get('id') as string | null)?.trim().toLowerCase() || '';
    const nameEn = (formData.get('name_en') as string | null)?.trim() || '';
    const nameId = (formData.get('name_id') as string | null)?.trim() || '';
    const sortOrderRaw = formData.get('sort_order') as string | null;
    const sortOrder = sortOrderRaw ? parseInt(sortOrderRaw, 10) : 0;
    const isActive = formData.get('is_active') === 'true' || formData.get('is_active') === 'on';

    if (!rawId) {
      return { success: false, error: 'Category identifier (slug) is required.' };
    }

    if (!/^[a-z0-9-]+$/.test(rawId)) {
      return { success: false, error: 'Identifier must contain only lowercase letters, numbers, and hyphens.' };
    }

    if (rawId.length > 32) {
      return { success: false, error: 'Identifier must not exceed 32 characters.' };
    }

    if (!nameEn) {
      return { success: false, error: 'English category name is required.' };
    }

    if (!nameId) {
      return { success: false, error: 'Indonesian category name is required.' };
    }

    // Check if ID already exists
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('id', rawId)
      .single();

    if (existing) {
      return { success: false, error: `Category with identifier '${rawId}' already exists.` };
    }

    const payload: CategoryInsert = {
      id: rawId,
      name_en: nameEn,
      name_id: nameId,
      sort_order: isNaN(sortOrder) ? 0 : sortOrder,
      is_active: isActive,
    };

    const { error: insertError } = await supabase
      .from('categories')
      .insert(payload);

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    revalidatePath('/admin/categories');
    revalidatePath('/admin');
    revalidatePath('/admin/initiatives');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' };
  }
}

/**
 * Server Action: Update existing category bilingual names and sort order.
 * Identifier (slug) is immutable to protect relational integrity with initiatives.
 */
export async function updateCategoryAction(id: string, formData: FormData) {
  try {
    const { supabase, isOwner } = await verifyOwner();
    if (!isOwner || !supabase) {
      return { success: false, error: 'Unauthorized: Owner session required.' };
    }

    if (!id) {
      return { success: false, error: 'Category ID is required.' };
    }

    const nameEn = (formData.get('name_en') as string | null)?.trim() || '';
    const nameId = (formData.get('name_id') as string | null)?.trim() || '';
    const sortOrderRaw = formData.get('sort_order') as string | null;
    const sortOrder = sortOrderRaw ? parseInt(sortOrderRaw, 10) : 0;
    const isActive = formData.get('is_active') === 'true' || formData.get('is_active') === 'on';

    if (!nameEn) {
      return { success: false, error: 'English category name is required.' };
    }

    if (!nameId) {
      return { success: false, error: 'Indonesian category name is required.' };
    }

    const payload: CategoryUpdate = {
      name_en: nameEn,
      name_id: nameId,
      sort_order: isNaN(sortOrder) ? 0 : sortOrder,
      is_active: isActive,
    };

    const { error: updateError } = await supabase
      .from('categories')
      .update(payload)
      .eq('id', id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath('/admin/categories');
    revalidatePath('/admin');
    revalidatePath('/admin/initiatives');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' };
  }
}

/**
 * Server Action: Toggle active state of category.
 */
export async function toggleCategoryActiveAction(id: string, isActive: boolean) {
  try {
    const { supabase, isOwner } = await verifyOwner();
    if (!isOwner || !supabase) {
      return { success: false, error: 'Unauthorized: Owner session required.' };
    }

    const { error } = await supabase
      .from('categories')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/categories');
    revalidatePath('/admin');
    revalidatePath('/admin/initiatives');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' };
  }
}

/**
 * Server Action: Delete category.
 * Guarded against deletion when referenced by initiatives (foreign key constraint safety).
 */
export async function deleteCategoryAction(id: string) {
  try {
    const { supabase, isOwner } = await verifyOwner();
    if (!isOwner || !supabase) {
      return { success: false, error: 'Unauthorized: Owner session required.' };
    }

    if (!id) {
      return { success: false, error: 'Category ID is required.' };
    }

    // Check if any initiatives reference this category
    const { count, error: countError } = await supabase
      .from('initiatives')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);

    if (countError) {
      return { success: false, error: `Failed to check category references: ${countError.message}` };
    }

    if (count && count > 0) {
      return {
        success: false,
        error: `Cannot delete category '${id}': ${count} initiative(s) are currently assigned to this category. Please reassign or delete those initiatives first.`,
      };
    }

    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    revalidatePath('/admin/categories');
    revalidatePath('/admin');
    revalidatePath('/admin/initiatives');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' };
  }
}

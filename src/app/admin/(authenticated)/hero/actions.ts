'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database';

type HeroMode = Database['public']['Enums']['hero_mode'];

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
 * Server Action: Update singleton hero configuration.
 */
export async function updateHeroConfigAction(formData: FormData) {
  try {
    const { supabase, isOwner } = await verifyOwner();
    if (!isOwner || !supabase) {
      return { success: false, error: 'Unauthorized: Owner session required.' };
    }

    const mode = (formData.get('mode') as HeroMode) || 'studio';
    const featuredInitiativeId = (formData.get('featured_initiative_id') as string | null)?.trim() || null;
    const showLifecycleBar = formData.get('show_lifecycle_bar') === 'true' || formData.get('show_lifecycle_bar') === 'on';

    if (mode !== 'studio' && mode !== 'featured_initiative') {
      return { success: false, error: 'Invalid hero presentation mode.' };
    }

    if (mode === 'featured_initiative') {
      if (!featuredInitiativeId) {
        return { success: false, error: 'A featured initiative must be selected when Featured Initiative Mode is active.' };
      }

      // Verify initiative exists and is published
      const { data: initiative, error: initError } = await supabase
        .from('initiatives')
        .select('id, name, publication_status')
        .eq('id', featuredInitiativeId)
        .single();

      if (initError || !initiative) {
        return { success: false, error: `Referenced initiative '${featuredInitiativeId}' does not exist.` };
      }

      if (initiative.publication_status !== 'published') {
        return {
          success: false,
          error: `Cannot spotlight '${initiative.name}' in Hero: Initiative is currently in '${initiative.publication_status}' status. Please publish it first.`,
        };
      }
    }

    const { error: updateError } = await supabase
      .from('hero_config')
      .update({
        mode,
        featured_initiative_id: mode === 'featured_initiative' ? featuredInitiativeId : null,
        show_lifecycle_bar: showLifecycleBar,
      })
      .eq('id', 'primary');

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath('/admin/hero');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' };
  }
}

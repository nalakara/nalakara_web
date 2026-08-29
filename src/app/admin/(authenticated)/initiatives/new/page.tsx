import React from 'react';
import { createClient } from '@/lib/supabase/server';
import InitiativeForm from '../InitiativeForm';

export const dynamic = 'force-dynamic';

export default async function NewInitiativePage() {
  const isDevBypass =
    process.env.NODE_ENV === 'development' &&
    process.env.ADMIN_DEV_BYPASS === 'true';

  let supabase;
  if (isDevBypass) {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    supabase = createAdminClient();
  } else {
    supabase = await createClient();
  }

  // Fetch active categories and current max sort_order
  const [categoriesRes, maxOrderRes] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name_en, name_id')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('initiatives')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const categories = categoriesRes.data || [];
  const nextSortOrder = (maxOrderRes.data?.sort_order ?? 0) + 1;

  return (
    <InitiativeForm
      mode="create"
      categories={categories}
      nextSortOrder={nextSortOrder}
    />
  );
}

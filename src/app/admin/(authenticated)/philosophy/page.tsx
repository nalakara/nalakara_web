import React from 'react';
import { createClient } from '@/lib/supabase/server';
import PrinciplesList from './PrinciplesList';

export default async function AdminPhilosophyPage() {
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

  // Fetch all principles ordered by sort_order and number
  const { data: principles, error: principlesError } = await supabase
    .from('studio_principles')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('number', { ascending: true });

  if (principlesError) {
    throw new Error(`Failed to load studio principles: ${principlesError.message}`);
  }

  return <PrinciplesList initialPrinciples={principles || []} />;
}

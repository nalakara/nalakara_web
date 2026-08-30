import React from 'react';
import { createClient } from '@/lib/supabase/server';
import HeroConfigForm from './HeroConfigForm';

export default async function AdminHeroPage() {
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

  // Fetch singleton hero_config
  const { data: heroConfig, error: heroError } = await supabase
    .from('hero_config')
    .select('*')
    .eq('id', 'primary')
    .single();

  if (heroError || !heroConfig) {
    throw new Error(`Failed to load hero configuration: ${heroError?.message || 'Record not found'}`);
  }

  // Fetch published initiatives for dropdown selection
  const { data: publishedInitiatives, error: initError } = await supabase
    .from('initiatives')
    .select('id, name, lifecycle_stage, publication_status')
    .eq('publication_status', 'published')
    .order('sort_order', { ascending: true });

  if (initError) {
    throw new Error(`Failed to load initiatives: ${initError.message}`);
  }

  return (
    <HeroConfigForm
      initialConfig={heroConfig}
      publishedInitiatives={publishedInitiatives || []}
    />
  );
}

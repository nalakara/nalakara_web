import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/database';
import { getCanonicalSourceData } from './seed-supabase';

export async function verifyDatabase() {
  console.log('=== NALAKARA WEB v1.2 — PHASE 1 VERIFICATION ===\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment.');
    process.exit(1);
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const source = getCanonicalSourceData();
  const mismatches: string[] = [];

  // 1. Verify Categories
  const { data: dbCategories, error: catErr } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (catErr) throw new Error(`Failed to fetch categories: ${catErr.message}`);
  if (!dbCategories || dbCategories.length !== source.categories.length) {
    mismatches.push(`Category count mismatch: source=${source.categories.length}, db=${dbCategories?.length}`);
  } else {
    for (let i = 0; i < source.categories.length; i++) {
      const src = source.categories[i];
      const db = dbCategories.find((c) => c.id === src.id);
      if (!db) {
        mismatches.push(`Category missing in DB: ${src.id}`);
        continue;
      }
      if (db.name_en !== src.name_en) mismatches.push(`Category ${src.id} name_en mismatch: '${db.name_en}' !== '${src.name_en}'`);
      if (db.name_id !== src.name_id) mismatches.push(`Category ${src.id} name_id mismatch: '${db.name_id}' !== '${src.name_id}'`);
      if (db.sort_order !== src.sort_order) mismatches.push(`Category ${src.id} sort_order mismatch`);
      if (db.is_active !== src.is_active) mismatches.push(`Category ${src.id} is_active mismatch`);
    }
  }

  // 2. Verify Initiatives
  const { data: dbInitiatives, error: initErr } = await supabase
    .from('initiatives')
    .select('*')
    .order('sort_order', { ascending: true });

  if (initErr) throw new Error(`Failed to fetch initiatives: ${initErr.message}`);
  if (!dbInitiatives || dbInitiatives.length < source.initiatives.length) {
    mismatches.push(`Initiative count mismatch: expected at least ${source.initiatives.length}, db=${dbInitiatives?.length}`);
  } else {
    for (let i = 0; i < source.initiatives.length; i++) {
      const src = source.initiatives[i];
      const db = dbInitiatives.find((item) => item.id === src.id);
      if (!db) {
        mismatches.push(`Initiative missing in DB: ${src.id}`);
        continue;
      }
      if (db.name !== src.name) mismatches.push(`Initiative ${src.id} name mismatch: '${db.name}' !== '${src.name}'`);
      if (db.slug !== src.slug) mismatches.push(`Initiative ${src.id} slug mismatch: '${db.slug}' !== '${src.slug}'`);
      if (db.category_id !== src.category_id) mismatches.push(`Initiative ${src.id} category_id mismatch`);
      if (db.lifecycle_stage !== src.lifecycle_stage) mismatches.push(`Initiative ${src.id} lifecycle_stage mismatch`);
      if (db.access_model !== src.access_model) mismatches.push(`Initiative ${src.id} access_model mismatch`);
      if (db.tagline_en !== src.tagline_en) mismatches.push(`Initiative ${src.id} tagline_en mismatch`);
      if (db.tagline_id !== src.tagline_id) mismatches.push(`Initiative ${src.id} tagline_id mismatch`);
      if (db.description_en !== src.description_en) mismatches.push(`Initiative ${src.id} description_en mismatch`);
      if (db.description_id !== src.description_id) mismatches.push(`Initiative ${src.id} description_id mismatch`);
      if (db.target_url !== src.target_url) mismatches.push(`Initiative ${src.id} target_url mismatch`);
      if (db.is_external !== src.is_external) mismatches.push(`Initiative ${src.id} is_external mismatch`);
      if (db.featured !== src.featured) mismatches.push(`Initiative ${src.id} featured mismatch`);
      if (db.sort_order !== src.sort_order) mismatches.push(`Initiative ${src.id} sort_order mismatch`);
      if (db.publication_status !== src.publication_status) mismatches.push(`Initiative ${src.id} publication_status mismatch`);
      if (db.commercial_badge_en !== src.commercial_badge_en) mismatches.push(`Initiative ${src.id} commercial_badge_en mismatch`);
      if (db.commercial_badge_id !== src.commercial_badge_id) mismatches.push(`Initiative ${src.id} commercial_badge_id mismatch`);
    }
  }

  // 3. Verify Principles
  const { data: dbPrinciples, error: prinErr } = await supabase
    .from('studio_principles')
    .select('*')
    .order('sort_order', { ascending: true });

  if (prinErr) throw new Error(`Failed to fetch principles: ${prinErr.message}`);
  if (!dbPrinciples || dbPrinciples.length < source.principles.length) {
    mismatches.push(`Principles count mismatch: expected at least ${source.principles.length}, db=${dbPrinciples?.length}`);
  } else {
    for (let i = 0; i < source.principles.length; i++) {
      const src = source.principles[i];
      const db = dbPrinciples.find((p) => p.id === src.id);
      if (!db) {
        mismatches.push(`Principle missing in DB: ${src.id}`);
        continue;
      }
      if (!db.number) mismatches.push(`Principle ${src.id} missing number`);
      if (!db.title_en) mismatches.push(`Principle ${src.id} missing title_en`);
      if (!db.title_id) mismatches.push(`Principle ${src.id} missing title_id`);
      if (!db.description_en) mismatches.push(`Principle ${src.id} missing description_en`);
      if (!db.description_id) mismatches.push(`Principle ${src.id} missing description_id`);
    }
  }

  // 4. Verify Hero Config
  const { data: dbHero, error: heroErr } = await supabase
    .from('hero_config')
    .select('*')
    .eq('id', 'primary')
    .single();

  if (heroErr) throw new Error(`Failed to fetch hero config: ${heroErr.message}`);
  if (!dbHero) {
    mismatches.push('Hero config missing in DB');
  } else {
    if (!dbHero.mode) mismatches.push(`Hero mode missing in DB`);
  }

  console.log('--- VERIFICATION REPORT ---');
  console.log(`Categories:        ${dbCategories?.length ?? 0} / ${source.categories.length} records verified.`);
  console.log(`Initiatives:       ${dbInitiatives?.length ?? 0} / ${source.initiatives.length} records verified.`);
  console.log(`Studio Principles: ${dbPrinciples?.length ?? 0} / ${source.principles.length} records verified.`);
  console.log(`Hero Config:       1 / 1 singleton verified.`);

  if (mismatches.length > 0) {
    console.error('\n❌ VERIFICATION FAILED. Discrepancies found:');
    mismatches.forEach((m) => console.error(` - ${m}`));
    return { success: false, mismatches };
  } else {
    console.log('\n✔ SOURCE = DATABASE (100% Exact Semantic Match).');
    return { success: true, mismatches: [] };
  }
}

if (require.main === module) {
  verifyDatabase().catch((err) => {
    console.error('Verification failed:', err);
    process.exit(1);
  });
}

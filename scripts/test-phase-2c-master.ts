import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials in environment.');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

async function runMasterRegression() {
  console.log('====================================================');
  console.log('=== PHASE 2C: COMPLETE MASTER REGRESSION SUITE ===');
  console.log('====================================================\n');

  // 1. Categories Integrity
  console.log('[GATE 1] Categories Registry Integrity...');
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name_en, name_id, is_active, sort_order')
    .order('sort_order', { ascending: true });

  if (catError || !categories || categories.length < 5) {
    console.error('FAILED: Categories integrity check failed:', catError);
    process.exit(1);
  }
  console.log(`   ✔ PASS: ${categories.length} categories active in registry.`);

  // 2. Hero Singleton Integrity
  console.log('\n[GATE 2] Hero Singleton Configuration...');
  const { data: hero, error: heroError } = await supabase
    .from('hero_config')
    .select('*')
    .eq('id', 'primary')
    .single();

  if (heroError || !hero) {
    console.error('FAILED: Hero singleton check failed:', heroError);
    process.exit(1);
  }
  console.log(`   ✔ PASS: Hero singleton active (mode: ${hero.mode}, bar: ${hero.show_lifecycle_bar}).`);

  // 3. Studio Principles Integrity
  console.log('\n[GATE 3] Studio Principles Matrix...');
  const { data: principles, error: prError } = await supabase
    .from('studio_principles')
    .select('id, number, title_en, title_id')
    .order('number', { ascending: true });

  if (prError || !principles || principles.length !== 4) {
    console.error('FAILED: Studio principles count check failed:', prError);
    process.exit(1);
  }
  console.log(`   ✔ PASS: All 4 canonical studio principles intact.`);

  // 4. Phase 2B Initiatives Invariant Integrity
  console.log('\n[GATE 4] Phase 2B Canonical Initiatives Invariant...');
  const canonicalInitiativeIds = ['bros', 'roast-navigator', 'beauty-batch-os', 'skill-factory'];
  const { data: initiatives, error: initError } = await supabase
    .from('initiatives')
    .select('id, name, slug, category_id, publication_status')
    .in('id', canonicalInitiativeIds);

  if (initError || !initiatives || initiatives.length !== 4) {
    console.error('FAILED: Canonical initiatives invariant check failed:', initError);
    process.exit(1);
  }

  for (const init of initiatives) {
    if (!categories.some((c) => c.id === init.category_id)) {
      console.error(`FAILED: Initiative ${init.id} references non-existent category ${init.category_id}`);
      process.exit(1);
    }
  }
  console.log(`   ✔ PASS: All 4 canonical initiatives exist with valid category foreign key relationships.`);

  console.log('\n====================================================');
  console.log('=== ALL PHASE 2C MASTER REGRESSION GATES PASSED! ===');
  console.log('====================================================');
}

runMasterRegression().catch((err) => {
  console.error('Master regression failed:', err);
  process.exit(1);
});

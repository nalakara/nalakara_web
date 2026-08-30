import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials in environment.');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

async function runHeroTests() {
  console.log('=== PHASE 2C: STEP 2 — HERO CONFIGURATION AUTOMATED VERIFICATION ===\n');

  // 1. Fetch current hero_config
  console.log('1. Reading current singleton hero_config...');
  const { data: initial, error: fetchError } = await supabase
    .from('hero_config')
    .select('*')
    .eq('id', 'primary')
    .single();

  if (fetchError || !initial) {
    console.error('FAILED: Could not fetch hero_config:', fetchError);
    process.exit(1);
  }
  console.log(`   ✔ PASS: Fetched hero_config: mode=${initial.mode}, show_lifecycle_bar=${initial.show_lifecycle_bar}`);

  // 2. Test Switching to Featured Initiative Mode with valid published initiative
  console.log('\n2. Testing Featured Initiative Mode with valid initiative (bros)...');
  const { data: updatedFeatured, error: updateFeaturedError } = await supabase
    .from('hero_config')
    .update({
      mode: 'featured_initiative',
      featured_initiative_id: 'bros',
      show_lifecycle_bar: false,
    })
    .eq('id', 'primary')
    .select()
    .single();

  if (updateFeaturedError || !updatedFeatured) {
    console.error('FAILED: Update to featured mode failed:', updateFeaturedError);
    process.exit(1);
  }
  console.log(`   ✔ PASS: Updated to mode='${updatedFeatured.mode}', featured='${updatedFeatured.featured_initiative_id}', bar=${updatedFeatured.show_lifecycle_bar}`);

  // 3. Test Singleton Check Constraint (cannot create a second row)
  console.log('\n3. Testing Singleton Constraint (attempting to insert duplicate config)...');
  const { error: duplicateError } = await supabase
    .from('hero_config')
    .insert({
      id: 'secondary',
      mode: 'studio',
    });

  if (!duplicateError) {
    console.error('FAILED: Database allowed inserting non-primary hero_config!');
    process.exit(1);
  }
  console.log(`   ✔ PASS: Database strictly rejected second hero_config row: ${duplicateError.message}`);

  // 4. Test Switching Back to Studio Mode
  console.log('\n4. Testing Switching back to Studio Mode...');
  const { data: restoredStudio, error: restoreError } = await supabase
    .from('hero_config')
    .update({
      mode: 'studio',
      featured_initiative_id: null,
      show_lifecycle_bar: true,
    })
    .eq('id', 'primary')
    .select()
    .single();

  if (restoreError || !restoredStudio) {
    console.error('FAILED: Restore to studio mode failed:', restoreError);
    process.exit(1);
  }
  console.log(`   ✔ PASS: Successfully restored to mode='${restoredStudio.mode}', bar=${restoredStudio.show_lifecycle_bar}`);

  console.log('\n==================================================');
  console.log('STEP 2 (HERO) ALL TESTS PASSED!');
  console.log('==================================================');
}

runHeroTests().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});

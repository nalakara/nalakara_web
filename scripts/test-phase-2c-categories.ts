import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials in environment.');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

async function runCategoriesTests() {
  console.log('=== PHASE 2C: STEP 1 — CATEGORIES AUTOMATED VERIFICATION ===\n');

  const testCatId = 'test-ai-system';

  // Cleanup before starting
  await supabase.from('categories').delete().eq('id', testCatId);

  // 1. Create a new test category
  console.log('1. Testing Category Creation...');
  const { data: created, error: createError } = await supabase
    .from('categories')
    .insert({
      id: testCatId,
      name_en: 'AI System Test',
      name_id: 'Sistem AI Uji',
      sort_order: 99,
      is_active: true,
    })
    .select()
    .single();

  if (createError || !created) {
    console.error('FAILED: Category creation failed:', createError);
    process.exit(1);
  }
  console.log(`   ✔ PASS: Created category '${created.id}' (${created.name_en} / ${created.name_id})`);

  // 2. Edit category bilingual names
  console.log('\n2. Testing Category Bilingual Edit...');
  const { data: updated, error: updateError } = await supabase
    .from('categories')
    .update({
      name_en: 'Autonomous Systems',
      name_id: 'Sistem Otonom',
      sort_order: 100,
    })
    .eq('id', testCatId)
    .select()
    .single();

  if (updateError || !updated) {
    console.error('FAILED: Category update failed:', updateError);
    process.exit(1);
  }
  console.log(`   ✔ PASS: Updated names to '${updated.name_en}' / '${updated.name_id}', sort_order: ${updated.sort_order}`);

  // 3. Toggle active status
  console.log('\n3. Testing Category Active Toggle...');
  const { data: toggled, error: toggleError } = await supabase
    .from('categories')
    .update({ is_active: false })
    .eq('id', testCatId)
    .select()
    .single();

  if (toggleError || !toggled || toggled.is_active !== false) {
    console.error('FAILED: Toggle active state failed:', toggleError);
    process.exit(1);
  }
  console.log(`   ✔ PASS: Toggled active state to ${toggled.is_active}`);

  // 4. Test Foreign Key Deletion Protection
  console.log('\n4. Testing Foreign Key Reference Protection (deleting category with assigned initiatives)...');
  // 'software' has initiatives assigned (e.g. bros, roast-navigator)
  const { error: protectedDeleteError } = await supabase
    .from('categories')
    .delete()
    .eq('id', 'software');

  if (!protectedDeleteError) {
    console.error('FAILED: Database allowed deleting category with active initiatives!');
    process.exit(1);
  }
  console.log(`   ✔ PASS: Database strictly rejected deleting 'software': ${protectedDeleteError.message}`);

  // 5. Test Deleting Unreferenced Category
  console.log('\n5. Testing Deleting Unreferenced Test Category...');
  const { error: safeDeleteError } = await supabase
    .from('categories')
    .delete()
    .eq('id', testCatId);

  if (safeDeleteError) {
    console.error('FAILED: Safe deletion failed:', safeDeleteError);
    process.exit(1);
  }
  console.log(`   ✔ PASS: Safely deleted test category '${testCatId}'`);

  // 6. Verify Canonical Categories Intact
  console.log('\n6. Verifying Canonical Categories in Database...');
  const { data: allCategories, error: listError } = await supabase
    .from('categories')
    .select('id, name_en, name_id, is_active, sort_order')
    .order('sort_order', { ascending: true });

  if (listError || !allCategories) {
    console.error('FAILED: Failed to list categories:', listError);
    process.exit(1);
  }

  console.log(`   Found ${allCategories.length} categories:`);
  for (const c of allCategories) {
    console.log(`   - [${c.id}] ${c.name_en} / ${c.name_id} (active: ${c.is_active}, order: ${c.sort_order})`);
  }

  console.log('\n==================================================');
  console.log('STEP 1 (CATEGORIES) ALL TESTS PASSED!');
  console.log('==================================================');
}

runCategoriesTests().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});

import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials in environment.');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

async function runPhilosophyTests() {
  console.log('=== PHASE 2C: STEP 3 — PHILOSOPHY (STUDIO PRINCIPLES) AUTOMATED VERIFICATION ===\n');

  const testId = 'test-principle-05';
  await supabase.from('studio_principles').delete().eq('id', testId);

  // 1. Fetch existing canonical principles
  console.log('1. Reading canonical principles from database...');
  const { data: initialPrinciples, error: fetchError } = await supabase
    .from('studio_principles')
    .select('id, number, title_en, title_id, sort_order, publication_status')
    .order('number', { ascending: true });

  if (fetchError || !initialPrinciples) {
    console.error('FAILED: Could not fetch studio_principles:', fetchError);
    process.exit(1);
  }
  console.log(`   ✔ PASS: Found ${initialPrinciples.length} canonical principles:`);
  for (const p of initialPrinciples) {
    console.log(`     - [${p.number}] ${p.title_en} / ${p.title_id} (${p.publication_status})`);
  }

  // 2. Create a test principle
  console.log('\n2. Testing Principle Creation...');
  const { data: created, error: createError } = await supabase
    .from('studio_principles')
    .insert({
      id: testId,
      number: '05',
      title_en: 'Craft Over Hype',
      title_id: 'Keahlian di Atas Sensasi',
      description_en: 'We prioritize deep technical integrity over superficial trends.',
      description_id: 'Kami memprioritaskan integritas teknis mendalam di atas tren dangkal.',
      sort_order: 5,
      publication_status: 'published',
    })
    .select()
    .single();

  if (createError || !created) {
    console.error('FAILED: Could not create test principle:', createError);
    process.exit(1);
  }
  console.log(`   ✔ PASS: Created principle ${created.number}: ${created.title_en}`);

  // 3. Update the test principle
  console.log('\n3. Testing Principle Update...');
  const { data: updated, error: updateError } = await supabase
    .from('studio_principles')
    .update({
      title_en: 'Rigorous Craftsmanship',
      title_id: 'Keahlian yang Disiplin',
      publication_status: 'draft',
    })
    .eq('id', testId)
    .select()
    .single();

  if (updateError || !updated) {
    console.error('FAILED: Could not update test principle:', updateError);
    process.exit(1);
  }
  console.log(`   ✔ PASS: Updated principle: ${updated.title_en} (${updated.publication_status})`);

  // 4. Delete the test principle
  console.log('\n4. Testing Principle Deletion...');
  const { error: deleteError } = await supabase
    .from('studio_principles')
    .delete()
    .eq('id', testId);

  if (deleteError) {
    console.error('FAILED: Could not delete test principle:', deleteError);
    process.exit(1);
  }
  console.log(`   ✔ PASS: Safely deleted test principle '${testId}'`);

  // 5. Verify Canonical 4 Principles are intact
  console.log('\n5. Verifying Canonical 4 Principles are 100% intact...');
  const { data: finalPrinciples, error: finalError } = await supabase
    .from('studio_principles')
    .select('number, title_en')
    .order('number', { ascending: true });

  if (finalError || !finalPrinciples || finalPrinciples.length !== 4) {
    console.error(`FAILED: Expected 4 canonical principles, found ${finalPrinciples?.length}`);
    process.exit(1);
  }
  console.log('   ✔ PASS: Exactly 4 canonical principles present in database.');

  console.log('\n==================================================');
  console.log('STEP 3 (PHILOSOPHY) ALL TESTS PASSED!');
  console.log('==================================================');
}

runPhilosophyTests().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});

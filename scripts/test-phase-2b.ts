import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/database';
import { formatSlug } from '../src/app/admin/(authenticated)/initiatives/utils';

async function main() {
  console.log('=== PHASE 2B: FUNCTIONAL & DATABASE VERIFICATION ===\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. Initial State Check: Verify 4 canonical initiatives exist
  const { data: initialInitiatives, error: initialErr } = await supabase
    .from('initiatives')
    .select('id, slug, name, category_id, lifecycle_stage, access_model, publication_status, sort_order')
    .order('sort_order', { ascending: true });

  if (initialErr || !initialInitiatives) {
    throw new Error(`Failed to fetch initial initiatives: ${initialErr?.message}`);
  }

  console.log(`[PASS] 1. Initial Initiatives Loaded: ${initialInitiatives.length} records found.`);
  const canonicalIds = ['bros', 'roast-navigator', 'beauty-batch-os', 'skill-factory'];
  for (const id of canonicalIds) {
    const found = initialInitiatives.find((i) => i.id === id);
    if (!found) {
      throw new Error(`CRITICAL: Canonical initiative '${id}' is missing!`);
    }
    console.log(`       - ${found.name} (${found.id}): ${found.publication_status}, stage=${found.lifecycle_stage}`);
  }

  // 2. Slug Formatter Assertion Test
  console.log('\n[PASS] 2. Testing Slug Normalization:');
  const slugCases = [
    { input: 'My New AI Initiative', expected: 'my-new-ai-initiative' },
    { input: '  Special -- Symbols & Words!! ', expected: 'special-symbols-words' },
    { input: '---Trim---Hyphens---', expected: 'trim-hyphens' },
  ];
  for (const tc of slugCases) {
    const formatted = formatSlug(tc.input);
    if (formatted !== tc.expected) {
      throw new Error(`Slug format failed for '${tc.input}': got '${formatted}', expected '${tc.expected}'`);
    }
    console.log(`       - '${tc.input}' -> '${formatted}'`);
  }

  // 3. Test Initiative CRUD: Create Draft
  console.log('\n[TEST] 3. Creating Test Initiative Draft...');
  const testId = 'test-unit-initiative';
  // Clean up any stale test record before starting
  await supabase.from('initiatives').delete().eq('id', testId);

  const testPayload = {
    id: testId,
    slug: testId,
    name: 'Test Unit Initiative',
    category_id: 'software',
    lifecycle_stage: 'lab' as const,
    access_model: 'private-alpha' as const,
    tagline_en: 'Test tagline English',
    tagline_id: 'Test tagline Indonesian',
    description_en: 'Test description English',
    description_id: 'Test description Indonesian',
    target_url: 'https://test.nalakara.com',
    is_external: true,
    featured: false,
    sort_order: 99,
    publication_status: 'draft' as const,
    published_at: null,
  };

  const { error: createErr } = await supabase.from('initiatives').insert(testPayload);
  if (createErr) {
    throw new Error(`Failed to create test initiative: ${createErr.message}`);
  }

  const { data: createdRow } = await supabase.from('initiatives').select('*').eq('id', testId).single();
  if (!createdRow || createdRow.publication_status !== 'draft') {
    throw new Error(`Created row is not in draft status!`);
  }
  console.log('[PASS] 3. Test Initiative created in DRAFT status.');

  // 4. Test Duplicate Slug Rejection Check
  console.log('\n[TEST] 4. Testing Duplicate Slug Conflict Detection...');
  const { error: dupErr } = await supabase.from('initiatives').insert({
    ...testPayload,
    id: 'another-id-with-duplicate-slug',
    slug: testId, // Same slug
  });
  if (!dupErr) {
    throw new Error('Database allowed duplicate slug! Expected unique constraint violation.');
  }
  console.log(`[PASS] 4. Duplicate slug successfully rejected by unique constraint: ${dupErr.message}`);

  // 5. Test Draft Update
  console.log('\n[TEST] 5. Updating Test Initiative Draft...');
  const { error: updateErr } = await supabase
    .from('initiatives')
    .update({
      tagline_en: 'Updated English Tagline',
      sort_order: 100,
    })
    .eq('id', testId);

  if (updateErr) {
    throw new Error(`Failed to update test draft: ${updateErr.message}`);
  }
  const { data: updatedRow } = await supabase.from('initiatives').select('*').eq('id', testId).single();
  if (updatedRow?.tagline_en !== 'Updated English Tagline' || updatedRow.sort_order !== 100) {
    throw new Error('Draft update failed to persist updated values.');
  }
  console.log('[PASS] 5. Draft update verified.');

  // 6. Test Publication Status Transition
  console.log('\n[TEST] 6. Publishing Test Initiative...');
  const now = new Date().toISOString();
  const { error: pubErr } = await supabase
    .from('initiatives')
    .update({
      publication_status: 'published',
      published_at: now,
    })
    .eq('id', testId);

  if (pubErr) {
    throw new Error(`Failed to publish test initiative: ${pubErr.message}`);
  }
  const { data: publishedRow } = await supabase.from('initiatives').select('*').eq('id', testId).single();
  if (publishedRow?.publication_status !== 'published' || !publishedRow.published_at) {
    throw new Error('Publication transition failed.');
  }
  console.log('[PASS] 6. Publication transition verified (published_at timestamp assigned).');

  // 7. Test Archive Status Transition
  console.log('\n[TEST] 7. Archiving Test Initiative...');
  const { error: archErr } = await supabase
    .from('initiatives')
    .update({
      publication_status: 'archived',
    })
    .eq('id', testId);

  if (archErr) {
    throw new Error(`Failed to archive test initiative: ${archErr.message}`);
  }
  const { data: archivedRow } = await supabase.from('initiatives').select('*').eq('id', testId).single();
  if (archivedRow?.publication_status !== 'archived') {
    throw new Error('Archive transition failed.');
  }
  console.log('[PASS] 7. Archive transition verified.');

  // 8. Test Clean Deletion of Test Initiative
  console.log('\n[TEST] 8. Deleting Test Initiative...');
  const { error: delErr } = await supabase.from('initiatives').delete().eq('id', testId);
  if (delErr) {
    throw new Error(`Failed to delete test initiative: ${delErr.message}`);
  }
  const { data: deletedCheck } = await supabase.from('initiatives').select('id').eq('id', testId).maybeSingle();
  if (deletedCheck) {
    throw new Error('Test initiative still exists after delete!');
  }
  console.log('[PASS] 8. Test Initiative deleted cleanly.');

  // 9. Final Parity Check: Verify canonical initiatives remain 100% intact
  console.log('\n[TEST] 9. Final Database Parity Check...');
  const { data: finalInitiatives } = await supabase
    .from('initiatives')
    .select('id, name, publication_status')
    .order('sort_order', { ascending: true });

  for (const id of canonicalIds) {
    if (!finalInitiatives?.some((i) => i.id === id)) {
      throw new Error(`Canonical initiative ${id} is missing!`);
    }
  }
  console.log(`[PASS] 9. Canonical Initiatives Intact (4/4 records confirmed, ${finalInitiatives?.length} total in DB).`);

  console.log('\n==================================================');
  console.log('ALL PHASE 2B DATABASE & FUNCTIONAL TESTS PASSED!');
  console.log('==================================================\n');
}

main().catch((err) => {
  console.error('\n[FATAL ERROR in Phase 2B Verification]:', err);
  process.exit(1);
});

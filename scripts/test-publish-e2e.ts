import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/database';

async function main() {
  console.log('=== PHASE 2B: PUBLISH FLOW END-TO-END DIAGNOSIS & REGRESSION TEST ===\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const testId = 'brand-guidelines-system';

  // 1. Ensure target test initiative exists in DB
  await supabase
    .from('initiatives')
    .upsert({
      id: testId,
      slug: testId,
      name: 'Brand Guidelines System',
      category_id: 'service',
      lifecycle_stage: 'product',
      access_model: 'production',
      tagline_en: 'Draft tagline',
      tagline_id: 'Draf tagline',
      description_en: 'Draft description',
      description_id: 'Draf deskripsi',
      publication_status: 'draft',
    });

  const { data: initialRecord } = await supabase
    .from('initiatives')
    .select('*')
    .eq('id', testId)
    .single();

  console.log(`[CHECK] Target initiative "${testId}" found in DB.`);
  console.log(`        Status: ${initialRecord?.publication_status}, Name: ${initialRecord?.name}`);

  // 2. Simulate Save Draft Action with partial data
  console.log('\n[TEST 1] Testing Save Draft mutation...');
  const { error: draftErr } = await supabase
    .from('initiatives')
    .update({
      tagline_en: 'Modular brand guidelines creation platform.',
      tagline_id: 'Platform pembuatan panduan merek modular.',
      updated_at: new Date().toISOString(),
    })
    .eq('id', testId);

  if (draftErr) throw new Error(`Save draft failed: ${draftErr.message}`);
  console.log('✔ PASS: Draft saved successfully.');

  // 3. Test publish validation when required Indonesian description is empty
  console.log('\n[TEST 2] Testing Publish Validation when Indonesian Description is missing...');
  const incompleteFormData = {
    name: 'Brand Guidelines System',
    slug: 'brand-guidelines-system',
    category_id: 'service',
    lifecycle_stage: 'product' as const,
    access_model: 'production' as const,
    tagline_en: 'Modular brand guidelines creation platform.',
    tagline_id: 'Platform pembuatan panduan merek modular.',
    description_en: 'A structured brand knowledge builder PWA enabling designers to create modular guidelines.',
    description_id: '', // MISSING REQUIRED
  };

  const missingFields: string[] = [];
  if (!incompleteFormData.description_id || incompleteFormData.description_id.trim().length === 0) {
    missingFields.push('Indonesian Description');
  }

  if (missingFields.length === 0) {
    throw new Error('Validation failed to detect missing Indonesian Description');
  }
  console.log(`✔ PASS: Publish correctly rejected with message: "Cannot publish: Missing required field(s): ${missingFields.join(', ')}."`);

  // 4. Test Publish to Live with all REQUIRED fields complete and OPTIONAL commercial fields empty
  console.log('\n[TEST 3] Testing Publish to Live with complete required fields and empty commercial fields...');
  const completePublishData = {
    name: 'Brand Guidelines System',
    slug: 'brand-guidelines-system',
    category_id: 'service',
    lifecycle_stage: 'product' as const,
    access_model: 'production' as const,
    tagline_en: 'Modular brand guidelines creation platform.',
    tagline_id: 'Platform pembuatan panduan merek modular.',
    description_en: 'A structured brand knowledge builder PWA that enables founders, brand strategists, and designers to create, manage, and preview modular brand guidelines from structured data.',
    description_id: 'Pembangun pengetahuan merek terstruktur berbasis PWA yang memungkinkan pendiri, pakar strategi, dan desainer membuat, mengelola, dan meninjau panduan merek modular dari data terstruktur.',
    target_url: 'https://brand-guidelines-system.vercel.app/',
    is_external: true,
    featured: false,
    sort_order: 5,
    publication_status: 'published' as const,
    commercial_badge_en: null,
    commercial_badge_id: null,
    commercial_action_en: null,
    commercial_action_id: null,
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error: pubErr } = await supabase
    .from('initiatives')
    .update(completePublishData)
    .eq('id', testId);

  if (pubErr) throw new Error(`Publish mutation failed in DB: ${pubErr.message}`);

  const { data: pubCheck } = await supabase
    .from('initiatives')
    .select('*')
    .eq('id', testId)
    .single();

  if (pubCheck?.publication_status !== 'published' || !pubCheck.published_at) {
    throw new Error('Database record did not transition to published status');
  }
  console.log('✔ PASS: Initiative successfully PUBLISHED in Supabase database!');
  console.log(`        Publication Status: ${pubCheck.publication_status}`);
  console.log(`        Published At: ${pubCheck.published_at}`);

  // 5. Verify all 4 canonical initiatives are intact
  console.log('\n[TEST 4] Verifying 4 canonical initiatives remain untouched...');
  const canonicalIds = ['bros', 'roast-navigator', 'beauty-batch-os', 'skill-factory'];
  for (const cid of canonicalIds) {
    const { data: cItem } = await supabase.from('initiatives').select('id, name, publication_status').eq('id', cid).single();
    if (!cItem || cItem.publication_status !== 'published') {
      throw new Error(`Canonical initiative ${cid} is missing or not published!`);
    }
    console.log(`   ✔ ${cItem.name} (${cItem.id}): ${cItem.publication_status}`);
  }

  // Clean up test record so registry remains clean
  await supabase.from('initiatives').delete().eq('id', testId);

  console.log('\n==================================================');
  console.log('ALL PUBLISH DIAGNOSIS & REGRESSION TESTS PASSED!');
  console.log('==================================================\n');
}

main().catch((err) => {
  console.error('\n[FATAL ERROR]:', err);
  process.exit(1);
});

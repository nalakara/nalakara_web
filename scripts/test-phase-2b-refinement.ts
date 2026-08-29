import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/database';

async function main() {
  console.log('=== PHASE 2B REFINEMENT: PUBLISH POLICY & VALIDATION TEST ===\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const testId = 'test-refinement-initiative';
  // Clean up any stale record before start
  await supabase.from('initiatives').delete().eq('id', testId);

  // -------------------------------------------------------------
  // TEST 1: SAVE DRAFT WITH INCOMPLETE CONTENT
  // -------------------------------------------------------------
  console.log('[TEST 1] Saving incomplete draft (empty bilingual fields)...');
  const draftPayload = {
    id: testId,
    slug: testId,
    name: 'Draft Work in Progress',
    category_id: 'software',
    lifecycle_stage: 'idea' as const,
    access_model: 'concept' as const,
    tagline_en: '',
    tagline_id: '',
    description_en: '',
    description_id: '',
    target_url: null,
    is_external: false,
    featured: false,
    sort_order: 10,
    publication_status: 'draft' as const,
    commercial_badge_en: null,
    commercial_badge_id: null,
    commercial_action_en: null,
    commercial_action_id: null,
    published_at: null,
  };

  const { error: draftErr } = await supabase.from('initiatives').insert(draftPayload);
  if (draftErr) {
    throw new Error(`Failed to save incomplete draft: ${draftErr.message}`);
  }
  console.log('✔ PASS: Incomplete draft successfully saved to database in DRAFT status.\n');

  // -------------------------------------------------------------
  // TEST 2: PUBLISH VALIDATION - MISSING REQUIRED EN FIELD
  // -------------------------------------------------------------
  console.log('[TEST 2] Testing Publish validation when English Tagline is missing...');
  function simulatePublishValidation(data: {
    name: string;
    slug: string;
    category_id: string;
    lifecycle_stage: string;
    access_model: string;
    tagline_en: string;
    tagline_id: string;
    description_en: string;
    description_id: string;
    commercial_badge_en?: string | null;
    commercial_badge_id?: string | null;
    commercial_action_en?: string | null;
    commercial_action_id?: string | null;
  }) {
    const missing: string[] = [];
    const fieldErrors: Record<string, string> = {};

    if (!data.name || data.name.trim().length === 0) missing.push('Initiative Name');
    if (!data.slug || data.slug.trim().length === 0) missing.push('Slug Identifier');
    if (!data.category_id || data.category_id.trim().length === 0) missing.push('Category');

    if (!data.tagline_en || data.tagline_en.trim().length === 0) {
      fieldErrors.tagline_en = 'English tagline is required for publication.';
      missing.push('English Tagline');
    }
    if (!data.tagline_id || data.tagline_id.trim().length === 0) {
      fieldErrors.tagline_id = 'Indonesian tagline is required for publication.';
      missing.push('Indonesian Tagline');
    }
    if (!data.description_en || data.description_en.trim().length === 0) {
      fieldErrors.description_en = 'English description is required for publication.';
      missing.push('English Description');
    }
    if (!data.description_id || data.description_id.trim().length === 0) {
      fieldErrors.description_id = 'Indonesian description is required for publication.';
      missing.push('Indonesian Description');
    }

    // Commercial optional pairing check
    if ((data.commercial_badge_en && !data.commercial_badge_id) || (!data.commercial_badge_en && data.commercial_badge_id)) {
      fieldErrors.commercial_badge_en = 'Both English and Indonesian commercial badges must be provided together if used.';
      fieldErrors.commercial_badge_id = 'Both English and Indonesian commercial badges must be provided together if used.';
    }

    const isValid = Object.keys(fieldErrors).length === 0 && missing.length === 0;
    return {
      isValid,
      missing,
      fieldErrors,
      errorMessage: !isValid
        ? missing.length > 0
          ? `Cannot publish: Missing required field(s): ${missing.join(', ')}.`
          : 'Cannot publish: Please resolve the highlighted validation errors.'
        : null,
    };
  }

  const resMissingEn = simulatePublishValidation({
    name: 'Draft Work in Progress',
    slug: testId,
    category_id: 'software',
    lifecycle_stage: 'project',
    access_model: 'private-alpha',
    tagline_en: '', // MISSING
    tagline_id: 'Tagline Indonesia yang terisi',
    description_en: 'Complete English description',
    description_id: 'Deskripsi Indonesia yang lengkap',
  });

  if (resMissingEn.isValid || !resMissingEn.fieldErrors.tagline_en || !resMissingEn.missing.includes('English Tagline')) {
    throw new Error(`Publish validation failed to catch missing English Tagline!`);
  }
  console.log(`✔ PASS: Publish rejected with precise feedback: "${resMissingEn.errorMessage}"\n`);

  // -------------------------------------------------------------
  // TEST 3: PUBLISH VALIDATION - MISSING REQUIRED ID FIELD
  // -------------------------------------------------------------
  console.log('[TEST 3] Testing Publish validation when Indonesian Description is missing...');
  const resMissingId = simulatePublishValidation({
    name: 'Draft Work in Progress',
    slug: testId,
    category_id: 'software',
    lifecycle_stage: 'project',
    access_model: 'private-alpha',
    tagline_en: 'Complete English Tagline',
    tagline_id: 'Tagline Indonesia yang terisi',
    description_en: 'Complete English description',
    description_id: '   ', // WHITESPACE ONLY
  });

  if (resMissingId.isValid || !resMissingId.fieldErrors.description_id || !resMissingId.missing.includes('Indonesian Description')) {
    throw new Error(`Publish validation failed to catch missing Indonesian Description!`);
  }
  console.log(`✔ PASS: Publish rejected with precise feedback: "${resMissingId.errorMessage}"\n`);

  // -------------------------------------------------------------
  // TEST 4: PUBLISH WITH ALL REQUIRED FIELDS + OPTIONAL FIELDS EMPTY
  // -------------------------------------------------------------
  console.log('[TEST 4] Publishing with complete required fields and EMPTY optional commercial metadata & target_url...');
  const completeRequiredData = {
    name: 'Refined Utility Initiative',
    slug: testId,
    category_id: 'software',
    lifecycle_stage: 'project' as const,
    access_model: 'private-alpha' as const,
    tagline_en: 'Autonomous operations framework.',
    tagline_id: 'Kerangka kerja operasi mandiri.',
    description_en: 'An operational backbone engineered for structured execution.',
    description_id: 'Fondasi operasional yang dirancang untuk eksekusi terstruktur.',
    commercial_badge_en: null,
    commercial_badge_id: null,
    commercial_action_en: null,
    commercial_action_id: null,
  };

  const resComplete = simulatePublishValidation(completeRequiredData);
  if (!resComplete.isValid) {
    throw new Error(`Publish validation falsely rejected valid required fields: ${resComplete.errorMessage}`);
  }

  // Update in DB with publication_status = 'published'
  const publishedAt = new Date().toISOString();
  const { error: pubErr } = await supabase
    .from('initiatives')
    .update({
      ...completeRequiredData,
      publication_status: 'published',
      published_at: publishedAt,
      sort_order: 0,
      target_url: null,
      featured: false,
      is_external: true,
    })
    .eq('id', testId);

  if (pubErr) {
    throw new Error(`Failed to update published record in DB: ${pubErr.message}`);
  }

  const { data: pubRow } = await supabase.from('initiatives').select('*').eq('id', testId).single();
  if (pubRow?.publication_status !== 'published' || !pubRow.published_at) {
    throw new Error('Database publication status transition failed!');
  }
  console.log('✔ PASS: Publishing SUCCEEDED with empty optional commercial fields!\n');

  // -------------------------------------------------------------
  // TEST 5: CLEANUP TEST RECORD & PARITY ASSERTION
  // -------------------------------------------------------------
  console.log('[TEST 5] Cleaning up test record and verifying canonical initiatives...');
  await supabase.from('initiatives').delete().eq('id', testId);

  const { data: canonicals } = await supabase.from('initiatives').select('id, name, publication_status').order('sort_order', { ascending: true });
  const canonicalIds = ['bros', 'roast-navigator', 'beauty-batch-os', 'skill-factory'];
  for (const cid of canonicalIds) {
    const found = canonicals?.find((c) => c.id === cid);
    if (!found) {
      throw new Error(`Canonical initiative ${cid} is missing!`);
    }
  }
  console.log(`✔ PASS: Database verified. ${canonicals?.length} initiatives total, all 4 canonical initiatives intact:`);
  canonicals?.forEach((c) => console.log(`   - ${c.name} (${c.id}): ${c.publication_status}`));

  console.log('\n==================================================');
  console.log('ALL PHASE 2B REFINEMENT VALIDATION TESTS PASSED!');
  console.log('==================================================\n');
}

main().catch((err) => {
  console.error('\n[FATAL ERROR]:', err);
  process.exit(1);
});

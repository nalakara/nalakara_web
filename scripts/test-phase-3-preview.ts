import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/database';
import { getPreviewData } from '../src/lib/supabase/preview';
import { ECOSYSTEM_INITIATIVES } from '../src/data/ecosystem';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials in environment.');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

async function runPhase3Tests() {
  console.log('--- STARTING PHASE 3 LIVE PREVIEW TEST SUITE ---');

  // 1. Data Adapter Verification
  console.log('1. Testing getPreviewData() mapping fidelity...');
  const previewData = await getPreviewData(supabase);

  if (!previewData) {
    throw new Error('getPreviewData() returned null or undefined.');
  }

  console.log(`✓ Initiatives loaded: ${previewData.initiatives.length}`);
  console.log(`✓ Featured initiatives: ${previewData.featuredInitiatives.length}`);
  console.log(`✓ Studio principles: ${previewData.principles.length}`);
  console.log(`✓ Hero Mode: ${previewData.heroConfig.mode}`);
  console.log(`✓ Draft count: ${previewData.draftCount}`);
  console.log(`✓ Published count: ${previewData.publishedCount}`);

  if (previewData.initiatives.length === 0) {
    throw new Error('Initiatives should not be empty in Supabase.');
  }

  if (previewData.principles.length === 0) {
    throw new Error('Studio principles should not be empty in Supabase.');
  }

  // 2. Draft Flag Isolation & Decorator Check
  console.log('2. Testing draft flag isolation...');
  const hasDrafts = previewData.initiatives.some((i) => i.isDraft);
  console.log(`✓ Active drafts present in preview dataset: ${hasDrafts ? 'Yes' : 'No'}`);

  for (const item of previewData.initiatives) {
    if (typeof item.isDraft !== 'boolean') {
      throw new Error(`Initiative '${item.id}' missing boolean isDraft property.`);
    }
  }

  // 3. Public Route Isolation Check
  console.log('3. Verifying public static data source immutability...');
  if (ECOSYSTEM_INITIATIVES.length === 0) {
    throw new Error('Static ECOSYSTEM_INITIATIVES is corrupted.');
  }
  for (const item of ECOSYSTEM_INITIATIVES) {
    if (item.isDraft !== undefined) {
      throw new Error(`Static item '${item.id}' should not have isDraft flag defined.`);
    }
  }
  console.log('✓ Public static data source remains pure, isolated, and untainted.');

  console.log('--- ALL PHASE 3 PREVIEW TESTS PASSED SUCCESSFULLY ---');
}

runPhase3Tests().catch((err) => {
  console.error('Phase 3 Test Failure:', err);
  process.exit(1);
});

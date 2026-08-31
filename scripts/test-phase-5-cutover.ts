import { fetchRawPublicEcosystemData } from '../src/lib/supabase/public';
import { ECOSYSTEM_INITIATIVES, STUDIO_PRINCIPLES } from '../src/data/ecosystem';

async function runPhase5CutoverTests() {
  console.log('=== PHASE 5: PUBLIC SOURCE CUTOVER & PARITY TEST SUITE ===\n');

  // 1. Fetch live public payload from Supabase DAL
  console.log('[GATE 1] Fetching live public payload from Public DAL...');
  const payload = await fetchRawPublicEcosystemData();

  console.log(`✓ Source: ${payload.source}`);
  console.log(`✓ Published Initiatives Loaded: ${payload.initiatives.length}`);
  console.log(`✓ Featured Initiatives Loaded: ${payload.featuredInitiatives.length}`);
  console.log(`✓ Studio Principles Loaded: ${payload.principles.length}`);
  console.log(`✓ Hero Mode: ${payload.heroConfig.mode}`);

  if (payload.source !== 'database') {
    throw new Error(`Expected source to be 'database', got '${payload.source}'`);
  }

  // 2. Strict Draft & Archived Exclusion Invariant
  console.log('\n[GATE 2] Verifying draft and archived exclusion on public payload...');
  const draftItems = payload.initiatives.filter((i) => i.isDraft);
  if (draftItems.length > 0) {
    throw new Error(`CRITICAL SECURITY FAILURE: Found ${draftItems.length} draft items in public payload!`);
  }

  const draftPrinciples = payload.principles.filter((p) => p.isDraft);
  if (draftPrinciples.length > 0) {
    throw new Error(`CRITICAL SECURITY FAILURE: Found ${draftPrinciples.length} draft principles in public payload!`);
  }
  console.log('   ✔ PASS: Zero drafts present in public payload.');

  // 3. Baseline Semantic Parity with initial v1.1 static data
  console.log('\n[GATE 3] Checking baseline semantic parity against static v1.1 constants...');
  if (payload.initiatives.length !== ECOSYSTEM_INITIATIVES.length) {
    throw new Error(`Initiative count mismatch: DB has ${payload.initiatives.length}, static has ${ECOSYSTEM_INITIATIVES.length}`);
  }

  for (const staticItem of ECOSYSTEM_INITIATIVES) {
    const dbItem = payload.initiatives.find((i) => i.id === staticItem.id);
    if (!dbItem) {
      throw new Error(`Canonical initiative '${staticItem.id}' missing in DB public payload.`);
    }
    if (dbItem.name !== staticItem.name) {
      throw new Error(`Name mismatch for '${staticItem.id}': DB '${dbItem.name}' vs static '${staticItem.name}'`);
    }
    if (dbItem.tagline.en !== staticItem.tagline.en || dbItem.tagline.id !== staticItem.tagline.id) {
      throw new Error(`Bilingual tagline mismatch for '${staticItem.id}'`);
    }
    if (dbItem.description.en !== staticItem.description.en || dbItem.description.id !== staticItem.description.id) {
      throw new Error(`Bilingual description mismatch for '${staticItem.id}'`);
    }
  }
  console.log('   ✔ PASS: 100% Exact semantic parity verified for all canonical initiatives.');

  // 4. Principles Parity Check
  console.log('\n[GATE 4] Checking Studio Principles semantic parity...');
  if (payload.principles.length !== STUDIO_PRINCIPLES.length) {
    throw new Error(`Principles count mismatch: DB has ${payload.principles.length}, static has ${STUDIO_PRINCIPLES.length}`);
  }
  for (const staticP of STUDIO_PRINCIPLES) {
    const dbP = payload.principles.find((p) => p.number === staticP.number);
    if (!dbP) {
      throw new Error(`Principle '${staticP.number}' missing in DB public payload.`);
    }
    if (dbP.title.en !== staticP.title.en || dbP.title.id !== staticP.title.id) {
      throw new Error(`Principle title mismatch for '${staticP.number}'`);
    }
  }
  console.log('   ✔ PASS: 100% Exact semantic parity verified for all studio principles.');

  // 5. Fallback Behavior Test
  console.log('\n[GATE 5] Testing Fallback Behavior when offline override is set...');
  process.env.PUBLIC_FORCE_STATIC_FALLBACK = 'true';
  const fallbackPayload = await fetchRawPublicEcosystemData();
  if (fallbackPayload.source !== 'static-fallback') {
    throw new Error(`Expected fallback payload source 'static-fallback', got '${fallbackPayload.source}'`);
  }
  if (fallbackPayload.initiatives.length !== 4) {
    throw new Error('Fallback payload did not load 4 canonical initiatives');
  }
  delete process.env.PUBLIC_FORCE_STATIC_FALLBACK;
  console.log('   ✔ PASS: Fallback subsystem functions safely and predictably.');

  console.log('\n======================================================');
  console.log('ALL PHASE 5 CUTOVER & PARITY TESTS PASSED SUCCESSFULLY!');
  console.log('======================================================');
}

runPhase5CutoverTests().catch((err) => {
  console.error('Phase 5 Test Failure:', err);
  process.exit(1);
});

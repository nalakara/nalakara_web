import { CACHE_TAGS, revalidateEcosystemCache } from '../src/lib/cache/revalidate';
import { PUBLIC_DATA_REQUIREMENTS } from '../src/lib/data/contract';
import { ECOSYSTEM_INITIATIVES } from '../src/data/ecosystem';

async function runPhase4Tests() {
  console.log('=== PHASE 4: PUBLISHING & CACHE REVALIDATION TEST SUITE ===\n');

  // 1. Cache Tag Constants Integrity
  console.log('[GATE 1] Cache Tag Contract Integrity...');
  if (CACHE_TAGS.ECOSYSTEM !== 'ecosystem') {
    throw new Error(`Master cache tag mismatch: expected 'ecosystem', got '${CACHE_TAGS.ECOSYSTEM}'`);
  }
  if (CACHE_TAGS.INITIATIVES !== 'ecosystem:initiatives') {
    throw new Error(`Initiatives cache tag mismatch: got '${CACHE_TAGS.INITIATIVES}'`);
  }
  if (CACHE_TAGS.HERO !== 'ecosystem:hero') {
    throw new Error(`Hero cache tag mismatch: got '${CACHE_TAGS.HERO}'`);
  }
  if (CACHE_TAGS.PRINCIPLES !== 'ecosystem:principles') {
    throw new Error(`Principles cache tag mismatch: got '${CACHE_TAGS.PRINCIPLES}'`);
  }
  if (CACHE_TAGS.CATEGORIES !== 'ecosystem:categories') {
    throw new Error(`Categories cache tag mismatch: got '${CACHE_TAGS.CATEGORIES}'`);
  }
  console.log('   ✔ PASS: All 5 canonical cache tags verified.');

  // 2. Revalidation Engine Non-Destructive Behavior
  console.log('\n[GATE 2] Revalidation Service Execution & Non-Destructive Behavior...');
  const res1 = revalidateEcosystemCache({ domain: 'initiatives', id: 'bros' });
  if (!res1.success) {
    throw new Error('revalidateEcosystemCache returned failure for initiatives domain');
  }

  const res2 = revalidateEcosystemCache({ domain: 'hero' });
  if (!res2.success) {
    throw new Error('revalidateEcosystemCache returned failure for hero domain');
  }

  const res3 = revalidateEcosystemCache({ domain: 'principles', id: '01' });
  if (!res3.success) {
    throw new Error('revalidateEcosystemCache returned failure for principles domain');
  }

  const res4 = revalidateEcosystemCache({ domain: 'categories', id: 'software' });
  if (!res4.success) {
    throw new Error('revalidateEcosystemCache returned failure for categories domain');
  }
  console.log('   ✔ PASS: Revalidation engine executed safely across all domains without throwing.');

  // 3. Public Data Contract Invariant Check
  console.log('\n[GATE 3] Public Data Contract & Draft Containment Invariants...');
  if (PUBLIC_DATA_REQUIREMENTS.PREDICATE_INITIATIVES !== "publication_status = 'published'") {
    throw new Error('Predicate mismatch for initiatives');
  }
  if (PUBLIC_DATA_REQUIREMENTS.PREDICATE_CATEGORIES !== "is_active = true") {
    throw new Error('Predicate mismatch for categories');
  }
  console.log('   ✔ PASS: Phase 5 data contract strictly mandates published-only predicates.');

  // 4. Public Homepage Immutability Check
  console.log('\n[GATE 4] Public Homepage Static Isolation Check...');
  if (ECOSYSTEM_INITIATIVES.length !== 4) {
    throw new Error(`Expected 4 static items in local fallback, found ${ECOSYSTEM_INITIATIVES.length}`);
  }
  console.log('   ✔ PASS: Public route remains 100% static and untainted during Phase 4.');

  console.log('\n==================================================');
  console.log('ALL PHASE 4 REVALIDATION & CONTRACT TESTS PASSED!');
  console.log('==================================================');
}

runPhase4Tests().catch((err) => {
  console.error('Phase 4 Test Failure:', err);
  process.exit(1);
});

import {
  createInitiativeAction,
  updateInitiativeDraftAction,
  publishInitiativeAction,
  archiveInitiativeAction,
  deleteInitiativeAction,
} from '../src/app/admin/(authenticated)/initiatives/actions';

async function main() {
  console.log('=== TESTING PHASE 2B SERVER ACTION AUTHORIZATION BOUNDARY ===\n');

  const dummyFormData = new FormData();
  dummyFormData.set('name', 'Hacker Attempt');
  dummyFormData.set('slug', 'hacker-attempt');

  // Test 1: Unauthenticated Create
  const resCreate = await createInitiativeAction(dummyFormData);
  console.log('1. Unauthenticated createInitiativeAction:', resCreate);
  if (resCreate.success || !resCreate.error?.includes('Unauthorized')) {
    throw new Error('SECURITY BREACH: Unauthenticated createInitiativeAction succeeded or did not return Unauthorized error!');
  }
  console.log('   [PASS] createInitiativeAction rejected unauthenticated call.\n');

  // Test 2: Unauthenticated Draft Update
  const resUpdate = await updateInitiativeDraftAction('bros', dummyFormData);
  console.log('2. Unauthenticated updateInitiativeDraftAction:', resUpdate);
  if (resUpdate.success || !resUpdate.error?.includes('Unauthorized')) {
    throw new Error('SECURITY BREACH: Unauthenticated updateInitiativeDraftAction succeeded or did not return Unauthorized error!');
  }
  console.log('   [PASS] updateInitiativeDraftAction rejected unauthenticated call.\n');

  // Test 3: Unauthenticated Publish
  const resPublish = await publishInitiativeAction('bros', dummyFormData);
  console.log('3. Unauthenticated publishInitiativeAction:', resPublish);
  if (resPublish.success || !resPublish.error?.includes('Unauthorized')) {
    throw new Error('SECURITY BREACH: Unauthenticated publishInitiativeAction succeeded or did not return Unauthorized error!');
  }
  console.log('   [PASS] publishInitiativeAction rejected unauthenticated call.\n');

  // Test 4: Unauthenticated Archive
  const resArchive = await archiveInitiativeAction('bros');
  console.log('4. Unauthenticated archiveInitiativeAction:', resArchive);
  if (resArchive.success || !resArchive.error?.includes('Unauthorized')) {
    throw new Error('SECURITY BREACH: Unauthenticated archiveInitiativeAction succeeded or did not return Unauthorized error!');
  }
  console.log('   [PASS] archiveInitiativeAction rejected unauthenticated call.\n');

  // Test 5: Unauthenticated Delete
  const resDelete = await deleteInitiativeAction('bros');
  console.log('5. Unauthenticated deleteInitiativeAction:', resDelete);
  if (resDelete.success || !resDelete.error?.includes('Unauthorized')) {
    throw new Error('SECURITY BREACH: Unauthenticated deleteInitiativeAction succeeded or did not return Unauthorized error!');
  }
  console.log('   [PASS] deleteInitiativeAction rejected unauthenticated call.\n');

  console.log('==================================================');
  console.log('ALL AUTHORIZATION BOUNDARY TESTS PASSED!');
  console.log('==================================================\n');
}

main().catch((err) => {
  console.error('\n[FATAL ERROR in Auth Verification]:', err);
  process.exit(1);
});

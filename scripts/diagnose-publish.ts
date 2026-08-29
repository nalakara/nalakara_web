import { createClient } from '@supabase/supabase-js';

async function testDiagnosis() {
  console.log('=== STEP 1: CHECK DATABASE STATE FOR brand-guidelines-system ===');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: item, error } = await supabase
    .from('initiatives')
    .select('*')
    .eq('id', 'brand-guidelines-system')
    .single();

  console.log('Current brand-guidelines-system in Supabase:');
  console.log('Data:', item);
  console.log('Error:', error);

  console.log('\n=== STEP 2: CHECK DEV SERVER GET /admin/initiatives/brand-guidelines-system ===');
  try {
    const res = await fetch('http://localhost:7000/admin/initiatives/brand-guidelines-system');
    console.log('GET Status:', res.status);
    const html = await res.text();
    console.log('HTML snippet length:', html.length);
    console.log('Contains "Publish to Live":', html.includes('Publish to Live'));
    console.log('Contains "Application error":', html.includes('Application error'));
  } catch (err: any) {
    console.log('Fetch error:', err.message);
  }
}

testDiagnosis().catch(console.error);

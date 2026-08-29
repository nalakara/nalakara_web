import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/database';
import { ECOSYSTEM_INITIATIVES, STUDIO_PRINCIPLES } from '../src/data/ecosystem';
import { DICTIONARY } from '../src/data/i18n';
import { InitiativeCategory } from '../src/types';

// Categories inventory from v1.1
const CATEGORY_IDS: InitiativeCategory[] = [
  'software',
  'digital-system',
  'physical-good',
  'service',
  'experimental'
];

export function getCanonicalSourceData() {
  const categories = CATEGORY_IDS.map((id, index) => ({
    id,
    name_en: id === 'software' ? 'Software' :
             id === 'digital-system' ? 'Digital System' :
             id === 'physical-good' ? 'Physical Instrument' :
             id === 'service' ? 'Studio Service' : 'Experimental Lab',
    name_id: id === 'software' ? 'Perangkat Lunak' :
             id === 'digital-system' ? 'Sistem Digital' :
             id === 'physical-good' ? 'Produk Fisik' :
             id === 'service' ? 'Layanan' : 'Eksperimental',
    sort_order: index + 1,
    is_active: true
  }));

  const initiatives = ECOSYSTEM_INITIATIVES.map((item) => ({
    id: item.id,
    slug: item.id,
    name: item.name,
    category_id: item.category,
    lifecycle_stage: item.status,
    access_model: item.accessModel,
    tagline_en: item.tagline.en,
    tagline_id: item.tagline.id,
    description_en: item.description.en,
    description_id: item.description.id,
    target_url: item.targetUrl ?? null,
    is_external: item.isExternal,
    featured: item.featured,
    sort_order: item.order,
    publication_status: 'published' as const,
    commercial_badge_en: item.commercial?.badgeLabel?.en ?? null,
    commercial_badge_id: item.commercial?.badgeLabel?.id ?? null,
    commercial_action_en: item.commercial?.actionLabel?.en ?? null,
    commercial_action_id: item.commercial?.actionLabel?.id ?? null
  }));

  const principles = STUDIO_PRINCIPLES.map((principle, index) => ({
    id: `principle-${principle.number}`,
    number: principle.number,
    title_en: principle.title.en,
    title_id: principle.title.id,
    description_en: principle.description.en,
    description_id: principle.description.id,
    sort_order: index + 1,
    publication_status: 'published' as const
  }));

  const hero = {
    id: 'primary',
    mode: 'studio' as const,
    featured_initiative_id: null,
    show_lifecycle_bar: true
  };

  return { categories, initiatives, principles, hero };
}

export function validateSourceData() {
  const data = getCanonicalSourceData();
  const errors: string[] = [];

  // 1. Categories validation
  if (data.categories.length !== 5) errors.push(`Expected 5 categories, found ${data.categories.length}`);
  for (const c of data.categories) {
    if (!c.id || !c.name_en || !c.name_id) errors.push(`Category ${c.id} missing required fields`);
  }

  // 2. Initiatives validation
  if (data.initiatives.length !== 4) errors.push(`Expected 4 initiatives, found ${data.initiatives.length}`);
  const catSet = new Set(data.categories.map((c) => c.id));
  const slugSet = new Set<string>();

  for (const item of data.initiatives) {
    if (slugSet.has(item.slug)) errors.push(`Duplicate slug found: ${item.slug}`);
    slugSet.add(item.slug);

    if (!catSet.has(item.category_id as InitiativeCategory)) {
      errors.push(`Initiative ${item.id} references invalid category ${item.category_id}`);
    }

    if (!item.name || item.name.trim().length === 0) errors.push(`Initiative ${item.id} missing name`);
    if (!item.tagline_en || item.tagline_en.trim().length === 0) errors.push(`Initiative ${item.id} missing tagline_en`);
    if (!item.tagline_id || item.tagline_id.trim().length === 0) errors.push(`Initiative ${item.id} missing tagline_id`);
    if (!item.description_en || item.description_en.trim().length === 0) errors.push(`Initiative ${item.id} missing description_en`);
    if (!item.description_id || item.description_id.trim().length === 0) errors.push(`Initiative ${item.id} missing description_id`);
  }

  // 3. Principles validation
  if (data.principles.length !== 4) errors.push(`Expected 4 principles, found ${data.principles.length}`);
  for (const p of data.principles) {
    if (!p.title_en || !p.title_id || !p.description_en || !p.description_id) {
      errors.push(`Principle ${p.number} missing required bilingual copy`);
    }
  }

  return { valid: errors.length === 0, errors, data };
}

export async function runMigration() {
  console.log('=== NALAKARA WEB v1.2 — PHASE 1 DATA MIGRATION ===\n');

  // Pre-flight validation
  const validation = validateSourceData();
  if (!validation.valid) {
    console.error('PRE-FLIGHT VALIDATION FAILED:');
    validation.errors.forEach((err) => console.error(` - ${err}`));
    process.exit(1);
  }
  console.log('✔ Pre-flight source data validation PASSED (100% complete).\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment.');
    process.exit(1);
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { categories, initiatives, principles, hero } = validation.data;

  // Step 1: Categories
  console.log(`1. Upserting ${categories.length} categories...`);
  const { error: catErr } = await supabase.from('categories').upsert(categories, { onConflict: 'id' });
  if (catErr) throw new Error(`Failed to upsert categories: ${catErr.message}`);
  console.log('   ✔ Categories upserted successfully.');

  // Step 2: Initiatives
  console.log(`2. Upserting ${initiatives.length} initiatives...`);
  const { error: initErr } = await supabase.from('initiatives').upsert(initiatives, { onConflict: 'id' });
  if (initErr) throw new Error(`Failed to upsert initiatives: ${initErr.message}`);
  console.log('   ✔ Initiatives upserted successfully.');

  // Step 3: Studio Principles
  console.log(`3. Upserting ${principles.length} studio principles...`);
  const { error: prinErr } = await supabase.from('studio_principles').upsert(principles, { onConflict: 'id' });
  if (prinErr) throw new Error(`Failed to upsert studio principles: ${prinErr.message}`);
  console.log('   ✔ Studio principles upserted successfully.');

  // Step 4: Hero Config
  console.log('4. Upserting hero singleton configuration...');
  const { error: heroErr } = await supabase.from('hero_config').upsert(hero, { onConflict: 'id' });
  if (heroErr) throw new Error(`Failed to upsert hero config: ${heroErr.message}`);
  console.log('   ✔ Hero config upserted successfully.\n');

  console.log('✔ MIGRATION EXECUTION COMPLETED SUCCESSFULLY.\n');
}

// Allow direct execution if run as script
if (require.main === module) {
  runMigration().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}

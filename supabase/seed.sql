-- ==============================================================================
-- NALAKARA WEB v1.2 — PHASE 1 DATA SEEDING (SQL DIRECT INSERT)
-- ==============================================================================
-- File ini dapat dijalankan langsung di Supabase Dashboard -> SQL Editor
-- untuk memasukkan data v1.1 secara manual dan instan tanpa terminal.
-- Seluruh query menggunakan ON CONFLICT DO UPDATE (Idempoten).
-- ==============================================================================

-- 1. SEED CATEGORIES (5 Kategori)
INSERT INTO categories (id, name_en, name_id, sort_order, is_active)
VALUES
  ('software', 'Software', 'Perangkat Lunak', 1, true),
  ('digital-system', 'Digital System', 'Sistem Digital', 2, true),
  ('physical-good', 'Physical Instrument', 'Produk Fisik', 3, true),
  ('service', 'Studio Service', 'Layanan', 4, true),
  ('experimental', 'Experimental Lab', 'Eksperimental', 5, true)
ON CONFLICT (id) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_id = EXCLUDED.name_id,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 2. SEED INITIATIVES (4 Inisiatif v1.1)
INSERT INTO initiatives (
  id, slug, name, category_id, lifecycle_stage, access_model,
  tagline_en, tagline_id, description_en, description_id,
  target_url, is_external, featured, sort_order, publication_status,
  commercial_badge_en, commercial_badge_id, commercial_action_en, commercial_action_id
)
VALUES
  (
    'bros',
    'bros',
    'B.R.O.S.',
    'software',
    'project',
    'private-alpha',
    'Autonomous operations and system intelligence framework.',
    'Kerangka kerja operasi mandiri dan kecerdasan sistem.',
    'An operational backbone engineered for managing autonomous workflows, structured execution, and multi-agent coordination.',
    'Fondasi operasional yang dirancang untuk mengelola alur kerja mandiri, eksekusi terstruktur, dan koordinasi multi-agen.',
    NULL,
    false,
    true,
    1,
    'published',
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'roast-navigator',
    'roast-navigator',
    'Roast Navigator',
    'digital-system',
    'project',
    'private-alpha',
    'Sensory and roast curve tracking platform for specialty coffee.',
    'Platform pelacakan kurva sangrai dan evaluasi sensorik kopi spesialti.',
    'A specialized digital system designed to evaluate roast kinetics, thermal trajectories, and sensory profiles.',
    'Sistem digital khusus untuk mengevaluasi kinetika sangrai, trajektori termal, dan profil sensorik rasa.',
    NULL,
    false,
    true,
    2,
    'published',
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'beauty-batch-os',
    'beauty-batch-os',
    'Beauty Batch OS',
    'software',
    'project',
    'private-alpha',
    'Formulation, compliance, and batch management system.',
    'Sistem manajemen formulasi, kepatuhan, dan produksi batch kosmetik.',
    'An operating framework engineered for cosmetic formulation labs to manage recipes, batch records, and ingredient inventory.',
    'Kerangka kerja operasional untuk laboratorium kosmetik dalam mengelola formula, catatan batch, dan inventaris bahan baku.',
    NULL,
    false,
    true,
    3,
    'published',
    'Commercial Candidate',
    'Kandidat Komersial',
    NULL,
    NULL
  ),
  (
    'skill-factory',
    'skill-factory',
    'Nalakara Skill Factory',
    'experimental',
    'lab',
    'private-alpha',
    'Modular agent skill synthesis and capability training pipeline.',
    'Alur sintesis kemampuan dan pelatihan keterampilan agen AI modular.',
    'A systematic lab environment for creating, benchmarking, and distributing specialized agent capabilities and domain toolkits.',
    'Lingkungan riset sistematis untuk merancang, menguji tolok ukur, dan mendistribusikan keahlian agen AI serta toolkit khusus.',
    NULL,
    false,
    false,
    4,
    'published',
    NULL,
    NULL,
    NULL,
    NULL
  )
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  lifecycle_stage = EXCLUDED.lifecycle_stage,
  access_model = EXCLUDED.access_model,
  tagline_en = EXCLUDED.tagline_en,
  tagline_id = EXCLUDED.tagline_id,
  description_en = EXCLUDED.description_en,
  description_id = EXCLUDED.description_id,
  target_url = EXCLUDED.target_url,
  is_external = EXCLUDED.is_external,
  featured = EXCLUDED.featured,
  sort_order = EXCLUDED.sort_order,
  publication_status = EXCLUDED.publication_status,
  commercial_badge_en = EXCLUDED.commercial_badge_en,
  commercial_badge_id = EXCLUDED.commercial_badge_id,
  commercial_action_en = EXCLUDED.commercial_action_en,
  commercial_action_id = EXCLUDED.commercial_action_id,
  updated_at = NOW();

-- 3. SEED STUDIO PRINCIPLES (4 Prinsip Filosofi)
INSERT INTO studio_principles (
  id, number, title_en, title_id, description_en, description_id, sort_order, publication_status
)
VALUES
  (
    'principle-01',
    '01',
    'Domain Independence',
    'Independensi Lintas Ranah',
    'Ideas are not restricted to a single industrial or technological vertical. We apply systemic thinking across digital software, physical instruments, and operational frameworks.',
    'Gagasan tidak dibatasi oleh satu bidang industri atau teknologi tertentu. Kami menerapkan pola pikir sistemik pada perangkat lunak digital, instrumen fisik, dan kerangka kerja operasional.',
    1,
    'published'
  ),
  (
    'principle-02',
    '02',
    'Utility Over Novelty',
    'Fungsi di Atas Kebaruan Semu',
    'We do not build purely decorative demonstrations. Every artifact originating from the foundry must perform real, verifiable work and solve concrete problems.',
    'Kami tidak membuat karya yang sekadar demonstrasi dekoratif. Setiap karya yang lahir dari studio harus berfungsi nyata, teruji, dan memecahkan masalah konkret.',
    2,
    'published'
  ),
  (
    'principle-03',
    '03',
    'Autonomous Product Identity',
    'Identitas Produk yang Mandiri',
    'Individual initiatives earn their own dedicated visual identities, distinct subdomains, and tailored user experiences rather than being forced into a uniform corporate template.',
    'Setiap inisiatif memiliki identitas visual tersendiri, subdomain khusus, dan pengalaman pengguna yang disesuaikan—bukan dipaksakan ke dalam template korporat yang seragam.',
    3,
    'published'
  ),
  (
    'principle-04',
    '04',
    'Disciplined Lifecycle Evolution',
    'Evolusi Siklus Hidup yang Disiplin',
    'Initiatives graduate deliberately through five verifiable states: Idea → Lab → Project → Product → Commercial. Progression requires stability, utility, and real-world validation.',
    'Inisiatif bertumbuh secara bertahap melalui lima fase terukur: Gagasan → Lab → Proyek → Produk → Komersial. Setiap kemajuan membutuhkan stabilitas, kegunaan, dan validasi nyata.',
    4,
    'published'
  )
ON CONFLICT (id) DO UPDATE SET
  number = EXCLUDED.number,
  title_en = EXCLUDED.title_en,
  title_id = EXCLUDED.title_id,
  description_en = EXCLUDED.description_en,
  description_id = EXCLUDED.description_id,
  sort_order = EXCLUDED.sort_order,
  publication_status = EXCLUDED.publication_status,
  updated_at = NOW();

-- 4. SEED HERO CONFIGURATION (Singleton)
INSERT INTO hero_config (id, mode, featured_initiative_id, show_lifecycle_bar)
VALUES ('primary', 'studio', NULL, true)
ON CONFLICT (id) DO UPDATE SET
  mode = EXCLUDED.mode,
  featured_initiative_id = EXCLUDED.featured_initiative_id,
  show_lifecycle_bar = EXCLUDED.show_lifecycle_bar,
  updated_at = NOW();

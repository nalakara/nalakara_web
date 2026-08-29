-- ==============================================================================
-- NALAKARA WEB v1.2 — SUPABASE FOUNDATION SCHEMA (REVISED & RECONCILED)
-- ==============================================================================

-- 1. Custom Controlled Enumerations
DO $$ BEGIN
  CREATE TYPE lifecycle_stage AS ENUM ('idea', 'lab', 'project', 'product', 'commercial');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE access_model AS ENUM ('concept', 'private-alpha', 'public-beta', 'production', 'commercial');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE publication_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE hero_mode AS ENUM ('studio', 'featured_initiative');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Automated updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Owner Allowlist / Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(32) PRIMARY KEY,
  name_en VARCHAR(64) NOT NULL,
  name_id VARCHAR(64) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Initiatives Table
CREATE TABLE IF NOT EXISTS initiatives (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(64) NOT NULL,
  category_id VARCHAR(32) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  lifecycle_stage lifecycle_stage NOT NULL DEFAULT 'idea',
  access_model access_model NOT NULL DEFAULT 'concept',
  tagline_en VARCHAR(140) NOT NULL,
  tagline_id VARCHAR(140) NOT NULL,
  description_en VARCHAR(320) NOT NULL,
  description_id VARCHAR(320) NOT NULL,
  target_url VARCHAR(255),
  is_external BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  publication_status publication_status NOT NULL DEFAULT 'draft',
  commercial_badge_en VARCHAR(40),
  commercial_badge_id VARCHAR(40),
  commercial_action_en VARCHAR(40),
  commercial_action_id VARCHAR(40),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_initiatives_publication_order ON initiatives(publication_status, sort_order);
CREATE INDEX IF NOT EXISTS idx_initiatives_category ON initiatives(category_id);

DROP TRIGGER IF EXISTS trg_initiatives_updated_at ON initiatives;
CREATE TRIGGER trg_initiatives_updated_at
  BEFORE UPDATE ON initiatives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Studio Principles Table
CREATE TABLE IF NOT EXISTS studio_principles (
  id VARCHAR(32) PRIMARY KEY,
  number VARCHAR(4) NOT NULL,
  title_en VARCHAR(80) NOT NULL,
  title_id VARCHAR(80) NOT NULL,
  description_en TEXT NOT NULL,
  description_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  publication_status publication_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_studio_principles_updated_at ON studio_principles;
CREATE TRIGGER trg_studio_principles_updated_at
  BEFORE UPDATE ON studio_principles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Hero Singleton Configuration
CREATE TABLE IF NOT EXISTS hero_config (
  id VARCHAR(16) PRIMARY KEY DEFAULT 'primary',
  mode hero_mode NOT NULL DEFAULT 'studio',
  featured_initiative_id VARCHAR(64) REFERENCES initiatives(id) ON DELETE SET NULL,
  show_lifecycle_bar BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT hero_singleton_check CHECK (id = 'primary')
);

DROP TRIGGER IF EXISTS trg_hero_config_updated_at ON hero_config;
CREATE TRIGGER trg_hero_config_updated_at
  BEFORE UPDATE ON hero_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. PostgreSQL Object-Level Grants (Required for PostgREST & API access)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO authenticated;
GRANT ALL ON categories TO service_role;

GRANT SELECT ON initiatives TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON initiatives TO authenticated;
GRANT ALL ON initiatives TO service_role;

GRANT SELECT ON studio_principles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON studio_principles TO authenticated;
GRANT ALL ON studio_principles TO service_role;

GRANT SELECT ON hero_config TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON hero_config TO authenticated;
GRANT ALL ON hero_config TO service_role;

GRANT SELECT ON admin_users TO authenticated;
GRANT ALL ON admin_users TO service_role;

-- 9. Enable Row Level Security (RLS) on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_principles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_config ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies: admin_users Table
-- Only authenticated users in the allowlist can view their own entry; no anon access
DROP POLICY IF EXISTS "Owner can view admin allowlist" ON admin_users;
CREATE POLICY "Owner can view admin allowlist" ON admin_users
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 11. Public Read Policies (anon / non-admin authenticated)
-- Only published content or active categories can be read publicly
DROP POLICY IF EXISTS "Public read active categories" ON categories;
CREATE POLICY "Public read active categories" ON categories
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read published initiatives" ON initiatives;
CREATE POLICY "Public read published initiatives" ON initiatives
  FOR SELECT USING (publication_status = 'published');

DROP POLICY IF EXISTS "Public read published principles" ON studio_principles;
CREATE POLICY "Public read published principles" ON studio_principles
  FOR SELECT USING (publication_status = 'published');

-- Hero config: public can read hero config IF in studio mode OR if the referenced featured initiative is published
DROP POLICY IF EXISTS "Public read hero config" ON hero_config;
CREATE POLICY "Public read hero config" ON hero_config
  FOR SELECT USING (
    mode = 'studio'
    OR featured_initiative_id IS NULL
    OR EXISTS (
      SELECT 1 FROM initiatives
      WHERE initiatives.id = hero_config.featured_initiative_id
        AND initiatives.publication_status = 'published'
    )
  );

-- 12. Owner-Only Management Policies (Strictly checking admin_users allowlist)
-- INSERT, UPDATE, DELETE, and draft SELECT only permitted for users in admin_users
DROP POLICY IF EXISTS "Owner full access categories" ON categories;
CREATE POLICY "Owner full access categories" ON categories
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Owner full access initiatives" ON initiatives;
CREATE POLICY "Owner full access initiatives" ON initiatives
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Owner full access principles" ON studio_principles;
CREATE POLICY "Owner full access principles" ON studio_principles
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Owner full access hero config" ON hero_config;
CREATE POLICY "Owner full access hero config" ON hero_config
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
  );

-- ==============================================================================
-- NALAKARA WEB v1.2 — COVER MEDIA MIGRATION
-- ==============================================================================
-- Description: Adds 4 nullable cover media columns to the initiatives table.
-- Supported media: 16:9 Image (JPG/PNG/WebP) or Ambient Video (MP4/WebM).
-- ==============================================================================

-- 1. Add cover media columns to public.initiatives table
ALTER TABLE public.initiatives
  ADD COLUMN IF NOT EXISTS cover_media_type VARCHAR(16),
  ADD COLUMN IF NOT EXISTS cover_media_url VARCHAR(512),
  ADD COLUMN IF NOT EXISTS cover_media_focal VARCHAR(32),
  ADD COLUMN IF NOT EXISTS cover_media_poster VARCHAR(512);

-- 2. Notify PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';

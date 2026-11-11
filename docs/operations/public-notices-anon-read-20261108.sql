-- Applied 2026-11-08 to existing announcement table.
-- Public endpoint reads *only* announcements already marked published and active.
-- This deliberate RLS policy allows Cloudflare public site to read announcements
-- without sharing a service_role or sb_secret_ key with a public Worker.
BEGIN;
GRANT SELECT (id,platform,version_label,title_zh,title_en,body_zh,body_en,published_at,expires_at,is_active)
  ON public.lingxifield_announcements TO anon,authenticated;
DROP POLICY IF EXISTS "sasi_public_published_announcements_read" ON public.lingxifield_announcements;
CREATE POLICY "sasi_public_published_announcements_read" ON public.lingxifield_announcements
  FOR SELECT TO anon,authenticated
  USING(is_active=true AND published_at<=now() AND (expires_at IS NULL OR expires_at>now()));
COMMIT;

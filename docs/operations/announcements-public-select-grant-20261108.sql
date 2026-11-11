-- Public website and mini-program release notices: column-scoped read access.
-- Use existing RLS policy to hide drafts, future releases, expired notices.
-- Preserve all legacy rows, messages, financial records and administrative writes.
BEGIN;
DO $$
BEGIN
 IF NOT EXISTS (
   SELECT 1 FROM pg_policies
   WHERE schemaname='public'
     AND tablename='lingxifield_announcements'
     AND policyname='sasi_public_published_announcements_read'
     AND cmd='SELECT'
 ) THEN
   RAISE EXCEPTION 'ANNOUNCEMENTS_PUBLIC_RLS_POLICY_REQUIRED';
 END IF;
END
$$;
ALTER TABLE public.lingxifield_announcements ENABLE ROW LEVEL SECURITY;
REVOKE SELECT ON public.lingxifield_announcements FROM anon,authenticated;
GRANT SELECT (
  id,platform,version_label,title_zh,title_en,body_zh,body_en,
  published_at,expires_at,is_active
) ON public.lingxifield_announcements TO anon,authenticated;
COMMIT;

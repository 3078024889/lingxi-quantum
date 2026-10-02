begin;
alter table public.sasi_provider_connections add column if not exists capabilities jsonb not null default '[]'::jsonb;
alter table public.sasi_provider_connections add column if not exists capability_checked_at timestamptz;
alter table public.sasi_provider_connections add column if not exists discovered_models jsonb not null default '[]'::jsonb;
-- BYOK supplier billing can be unknown to LINGXIFIELD; zero means "supplier direct / unknown here", not free supplier usage.
alter table public.sasi_byok_text_tasks drop constraint if exists sasi_byok_text_tasks_estimated_fen_check;
alter table public.sasi_byok_text_tasks add constraint sasi_byok_text_tasks_estimated_fen_check check (estimated_fen >= 0);
alter table public.sasi_byok_video_tasks drop constraint if exists sasi_byok_video_tasks_provider_check;
alter table public.sasi_byok_video_tasks add constraint sasi_byok_video_tasks_provider_check check (provider in ('volcengine','xai','openai','aliyun'));
alter table public.sasi_byok_video_tasks drop constraint if exists sasi_byok_video_tasks_estimated_fen_check;
alter table public.sasi_byok_video_tasks add constraint sasi_byok_video_tasks_estimated_fen_check check (estimated_fen >= 0);
commit;

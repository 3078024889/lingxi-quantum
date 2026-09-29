-- LINGXIFIELD V1602: public announcements + per-user read receipts.
create table if not exists public.lingxifield_announcements (
  id uuid primary key default gen_random_uuid(),
  platform text not null default 'all' check (platform in ('all','web','miniapp')),
  version_label text,
  title_zh text not null,
  body_zh text not null,
  title_en text,
  body_en text,
  published_at timestamptz not null default now(),
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.lingxifield_announcements enable row level security;
revoke all on public.lingxifield_announcements from anon, authenticated;
grant select,insert,update,delete on public.lingxifield_announcements to service_role;

create table if not exists public.lingxifield_notification_reads (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_key text not null,
  read_at timestamptz not null default now(),
  primary key(user_id,event_key)
);
alter table public.lingxifield_notification_reads enable row level security;
revoke all on public.lingxifield_notification_reads from anon, authenticated;
grant select,insert,update,delete on public.lingxifield_notification_reads to service_role;

create index if not exists lingxifield_announcements_live_idx
on public.lingxifield_announcements(is_active,published_at desc);

create index if not exists lingxifield_notification_reads_user_idx
on public.lingxifield_notification_reads(user_id,read_at desc);

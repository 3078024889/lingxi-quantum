begin;

create table if not exists public.temp_mailboxes(
  id uuid primary key default gen_random_uuid(),
  local_part text not null unique check(local_part ~ '^[a-z0-9]{6,32}$'),
  token_hash text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  destroyed_at timestamptz
);
create index if not exists temp_mailboxes_expiry_idx on public.temp_mailboxes(expires_at);

create table if not exists public.temp_mail_messages(
  id uuid primary key default gen_random_uuid(),
  mailbox_id uuid not null references public.temp_mailboxes(id) on delete cascade,
  sender text not null default '',
  subject text not null default '',
  text_body text not null default '',
  size_bytes integer not null default 0 check(size_bytes>=0 and size_bytes<=2000000),
  received_at timestamptz not null default now()
);
create index if not exists temp_mail_messages_box_time_idx on public.temp_mail_messages(mailbox_id,received_at desc);

create table if not exists public.burn_notes(
  id uuid primary key default gen_random_uuid(),
  ciphertext text not null,
  iv text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_at timestamptz
);
create index if not exists burn_notes_expiry_idx on public.burn_notes(expires_at);

alter table public.temp_mailboxes enable row level security;
alter table public.temp_mail_messages enable row level security;
alter table public.burn_notes enable row level security;

revoke all on public.temp_mailboxes from anon,authenticated;
revoke all on public.temp_mail_messages from anon,authenticated;
revoke all on public.burn_notes from anon,authenticated;

-- Cleanup is safe to invoke from a server-side scheduled job.
create or replace function public.cleanup_ephemeral_privacy_data()
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare a integer; b integer;
begin
  delete from public.temp_mailboxes where expires_at < now(); get diagnostics a=row_count;
  delete from public.burn_notes where expires_at < now() or consumed_at is not null; get diagnostics b=row_count;
  return jsonb_build_object('mailboxes',a,'burn_notes',b);
end $$;
revoke all on function public.cleanup_ephemeral_privacy_data() from public,anon,authenticated;
grant execute on function public.cleanup_ephemeral_privacy_data() to service_role,postgres;

commit;

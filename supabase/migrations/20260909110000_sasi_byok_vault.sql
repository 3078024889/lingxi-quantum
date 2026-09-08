-- Encrypted BYOK metadata. Ciphertext is service-role only and never readable through RLS.
begin;

create table if not exists public.sasi_provider_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('openai','xai','anthropic','luma','volcengine','aliyun','gemini')),
  encrypted_credential text not null check (char_length(encrypted_credential) between 40 and 2048),
  key_hint text not null check (key_hint ~ '^••••.{4}$'),
  fingerprint text not null check (fingerprint ~ '^[0-9a-f]{16}$'),
  health_status text not null default 'stored' check (health_status in ('stored','checking','healthy','unhealthy')),
  last_checked_at timestamptz,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create index if not exists sasi_provider_connections_user_idx on public.sasi_provider_connections(user_id, updated_at desc);
alter table public.sasi_provider_connections enable row level security;
drop policy if exists "no direct byok credential access" on public.sasi_provider_connections;
create policy "no direct byok credential access" on public.sasi_provider_connections for all using (false) with check (false);
revoke all on public.sasi_provider_connections from public, anon, authenticated;
grant all on public.sasi_provider_connections to service_role;

commit;

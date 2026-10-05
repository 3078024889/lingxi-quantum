begin;
create table if not exists public.sasi_experience_session_affinity(
 user_id uuid not null,
 session_key text not null,
 provider_id text not null,
 expires_at timestamptz not null,
 updated_at timestamptz not null default now(),
 primary key(user_id,session_key)
);
alter table public.sasi_experience_session_affinity enable row level security;
revoke all on public.sasi_experience_session_affinity from anon,authenticated;
create index if not exists sasi_experience_session_affinity_exp_idx on public.sasi_experience_session_affinity(expires_at);
commit;

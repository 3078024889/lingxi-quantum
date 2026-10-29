-- Staging only. Immutable review log; no public access.
create table if not exists public.ai_market_candidate_decisions (
 id uuid primary key default gen_random_uuid(),
 candidate_key text not null references public.ai_market_candidates(candidate_key),
 previous_status text not null,
 decision text not null check(decision in ('verified','rejected')),
 reason text not null check(char_length(reason) between 10 and 1000),
 actor_id uuid not null references auth.users(id),
 decided_at timestamptz not null default now()
);
create index if not exists ai_market_candidate_decisions_key_time
 on public.ai_market_candidate_decisions(candidate_key,decided_at desc);
alter table public.ai_market_candidate_decisions enable row level security;
revoke all on public.ai_market_candidate_decisions from anon,authenticated;
-- Decision writes must be server authenticated and only transition from candidate.
-- Atomic update + insert will be implemented as a SECURITY INVOKER RPC / DB transaction before approval is enabled.

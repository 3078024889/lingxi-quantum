-- SASI User-Triggered Intelligence Control Plane — V10.80

begin;

create table if not exists public.sasi_external_work_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete cascade,
  intent text not null check (
    intent in (
      'knowledge-answer',
      'teacher-extract',
      'teacher-review',
      'code-author',
      'director-reasoning'
    )
  ),
  reason text not null,
  payload_ref text null,
  state text not null default 'pending-user-trigger'
    check (
      state in (
        'pending-user-trigger',
        'triggered',
        'completed',
        'failed',
        'expired'
      )
    ),
  billing_request_id uuid null,
  provider text null,
  model text null,
  charged_fen integer null check (charged_fen is null or charged_fen >= 0),
  provider_cost_fen numeric null check (
    provider_cost_fen is null or provider_cost_fen >= 0
  ),
  error_code text null,
  created_at timestamptz not null default now(),
  triggered_at timestamptz null,
  completed_at timestamptz null,
  expires_at timestamptz null
);

create index if not exists sasi_external_work_queue_user_state_idx
  on public.sasi_external_work_queue(user_id, state, created_at desc);

alter table public.sasi_external_work_queue enable row level security;

drop policy if exists "sasi_external_work_owner_read"
  on public.sasi_external_work_queue;

create policy "sasi_external_work_owner_read"
on public.sasi_external_work_queue
for select to authenticated
using (user_id = auth.uid());

-- No authenticated write policy.
-- Creation/settlement is performed by trusted server routes.
-- External paid execution remains user-triggered.

commit;

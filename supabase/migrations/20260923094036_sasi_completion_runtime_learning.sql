-- SASI Completion Bundle — Runtime Learning & Feedback

begin;

create table if not exists public.sasi_runtime_learning_events (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_kind text not null check (
    event_kind in (
      'book-answer',
      'learning-answer',
      'research-answer',
      'teacher-review',
      'strategy-outcome'
    )
  ),
  scope text not null default 'user-private'
    check (scope in ('user-private','project-private','global-reviewed')),
  mode text null check (mode is null or mode in ('book','learning','research')),
  intelligence text null check (
    intelligence is null or intelligence in ('light','standard','high')
  ),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists sasi_runtime_learning_events_user_idx
  on public.sasi_runtime_learning_events(user_id, created_at desc);

create table if not exists public.sasi_user_learning_feedback (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  learning_event_id uuid not null references public.sasi_runtime_learning_events(id) on delete cascade,
  signal text not null check (
    signal in ('helpful','not-helpful','incorrect','insufficient-evidence')
  ),
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, learning_event_id)
);

alter table public.sasi_runtime_learning_events enable row level security;
alter table public.sasi_user_learning_feedback enable row level security;

drop policy if exists "sasi_runtime_events_owner_read"
  on public.sasi_runtime_learning_events;
create policy "sasi_runtime_events_owner_read"
on public.sasi_runtime_learning_events
for select to authenticated
using (user_id = auth.uid());

drop policy if exists "sasi_learning_feedback_owner_read"
  on public.sasi_user_learning_feedback;
create policy "sasi_learning_feedback_owner_read"
on public.sasi_user_learning_feedback
for select to authenticated
using (user_id = auth.uid());

-- No authenticated direct-write policies.
-- Trusted server routes create events and feedback after authentication.

commit;

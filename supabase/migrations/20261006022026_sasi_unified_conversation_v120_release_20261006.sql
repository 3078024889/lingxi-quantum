begin;
create table if not exists public.sasi_conversation_threads(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null,
 title text,
 active_mode text,
 project_id uuid,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.sasi_conversation_threads enable row level security;
revoke all on public.sasi_conversation_threads from anon,authenticated;
create index if not exists sasi_conversation_threads_user_idx on public.sasi_conversation_threads(user_id,updated_at desc);

create table if not exists public.sasi_conversation_messages(
 id uuid primary key default gen_random_uuid(),
 thread_id uuid not null references public.sasi_conversation_threads(id) on delete cascade,
 user_id uuid not null,
 parent_id uuid references public.sasi_conversation_messages(id) on delete set null,
 role text not null check(role in('user','assistant','system','tool')),
 mode text,
 state text not null default 'complete' check(state in('pending','streaming','complete','needs-connection','failed')),
 content text not null default '',
 run_id uuid,
 project_id uuid,
 artifact_refs jsonb not null default '[]'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.sasi_conversation_messages enable row level security;
revoke all on public.sasi_conversation_messages from anon,authenticated;
create index if not exists sasi_conversation_messages_thread_idx on public.sasi_conversation_messages(thread_id,created_at,id);
create index if not exists sasi_conversation_messages_user_idx on public.sasi_conversation_messages(user_id,created_at desc);
commit;

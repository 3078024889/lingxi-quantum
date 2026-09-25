begin;

alter table public.temp_mailboxes
  add column if not exists owner_user_id uuid references auth.users(id) on delete set null,
  add column if not exists source_kind text not null default 'single',
  add column if not exists batch_quote_id uuid references public.tool_payment_quotes(id) on delete set null;

do $$
begin
  if not exists(
    select 1 from pg_constraint
    where conname='temp_mailboxes_source_kind_check'
      and conrelid='public.temp_mailboxes'::regclass
  ) then
    alter table public.temp_mailboxes
      add constraint temp_mailboxes_source_kind_check
      check(source_kind in ('single','batch'));
  end if;
end $$;

create index if not exists temp_mailboxes_owner_expiry_idx
  on public.temp_mailboxes(owner_user_id,expires_at desc)
  where owner_user_id is not null;

create index if not exists temp_mailboxes_batch_quote_idx
  on public.temp_mailboxes(batch_quote_id)
  where batch_quote_id is not null;

-- Direct table access remains server-only.
alter table public.temp_mailboxes enable row level security;
revoke all on public.temp_mailboxes from public,anon,authenticated;

commit;

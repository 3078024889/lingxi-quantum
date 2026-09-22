create table if not exists public.report_translations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_key text not null,
  source_hash text not null,
  target_lang text not null check (target_lang in ('ja','ko','fr','de','es','pt','ar')),
  translated_items jsonb not null,
  provider text,
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, report_key, source_hash, target_lang)
);

alter table public.report_translations enable row level security;

drop policy if exists "report_translations_select_own" on public.report_translations;
create policy "report_translations_select_own"
on public.report_translations
for select
to authenticated
using (auth.uid() = user_id);

create index if not exists report_translations_user_report_idx
  on public.report_translations(user_id, report_key, target_lang);

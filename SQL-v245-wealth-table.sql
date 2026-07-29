-- 灵犀 v245 · 财富创造地图 配套 SQL
-- 在 Supabase 项目的 SQL Editor 里执行一次即可。

create table if not exists public.wealth_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text,
  facts jsonb not null,
  full_report text,
  full_report_en text,
  created_at timestamptz default now()
);
alter table public.wealth_submissions enable row level security;
drop policy if exists "own wealth submissions" on public.wealth_submissions;
create policy "own wealth submissions" on public.wealth_submissions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

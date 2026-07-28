-- 灵犀 v237 · 今日运势潮汐 · 深度报告 配套 SQL
-- 在 Supabase 项目的 SQL Editor 里执行一次即可。

create table if not exists public.daily_tide_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text,
  birth_input jsonb not null,
  facts jsonb not null,
  generated_date text not null, -- YYYY-MM-DD，报告是"从这一天开始往后看"的快照，不是每天都变
  full_report text,
  full_report_en text,
  created_at timestamptz default now()
);
alter table public.daily_tide_submissions enable row level security;
drop policy if exists "own daily tide submissions" on public.daily_tide_submissions;
create policy "own daily tide submissions" on public.daily_tide_submissions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 灵犀 v228 · 生命韧性指数、桃花磁场指数 升级为付费深度报告 配套 SQL
-- 在 Supabase 项目的 SQL Editor 里执行一次即可。
-- 免费快测（/api/resilience/calc、/api/romance/calc）完全不受影响，
-- 继续不登录、不写库、纯函数计算——这两张新表只服务新增的付费深度
-- 报告这条线，跟免费引流入口是两件事。

create table if not exists public.resilience_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text,
  birth_input jsonb not null,
  facts jsonb not null,
  full_report text,
  full_report_en text,
  created_at timestamptz default now()
);
alter table public.resilience_submissions enable row level security;
drop policy if exists "own resilience submissions" on public.resilience_submissions;
create policy "own resilience submissions" on public.resilience_submissions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.romance_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text,
  birth_input jsonb not null,
  facts jsonb not null,
  full_report text,
  full_report_en text,
  created_at timestamptz default now()
);
alter table public.romance_submissions enable row level security;
drop policy if exists "own romance submissions" on public.romance_submissions;
create policy "own romance submissions" on public.romance_submissions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

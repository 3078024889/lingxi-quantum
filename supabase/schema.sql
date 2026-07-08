-- ========================================
-- 灵犀 数据库结构（在 Supabase SQL Editor 执行一次）
-- 若已执行过旧版，本文件可重复执行（用 if not exists / drop policy 保护）
-- ========================================

-- 1) 用户档案表
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  manifest_until timestamptz,          -- 显化/梦境解读 订阅到期时间
  created_at timestamptz default now()
);

-- 2) 永久解锁的修炼技术（每行一项，如 breath / intuition / bundle）
create table if not exists public.unlocks (
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id text not null,            -- 'bundle' | 'breath' | 'intuition' | 'heart-reset' | 'ascending-heart'
  created_at timestamptz default now(),
  primary key (user_id, product_id)
);

-- 3) 现实回路
create table if not exists public.reality_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  entry_date date default current_date,
  today text,
  feeling text,
  created_at timestamptz default now()
);

-- 4) 用户愿景
create table if not exists public.visions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  vision text,
  updated_at timestamptz default now()
);

-- 4b) 提问灵犀（多维叙事 / 修炼技术等相关提问，记录进用户自己的日记）
create table if not exists public.field_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  question text not null,
  answer text,
  created_at timestamptz default now()
);

-- 5) 订单
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id text not null,
  product_type text not null,          -- 'permanent' | 'subscription'
  amount_usd numeric not null,
  status text default 'pending',
  provider text,
  provider_payment_id text,
  created_at timestamptz default now(),
  paid_at timestamptz
);

-- ========================================
-- 行级安全
-- ========================================
alter table public.profiles        enable row level security;
alter table public.unlocks         enable row level security;
alter table public.reality_entries enable row level security;
alter table public.visions         enable row level security;
alter table public.field_questions enable row level security;
alter table public.orders          enable row level security;

drop policy if exists "own profile read"   on public.profiles;
drop policy if exists "own profile write"  on public.profiles;
drop policy if exists "own profile insert" on public.profiles;
create policy "own profile read"   on public.profiles for select using (auth.uid() = id);
create policy "own profile write"  on public.profiles for update using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "own unlocks" on public.unlocks;
create policy "own unlocks" on public.unlocks for select using (auth.uid() = user_id);

drop policy if exists "own entries" on public.reality_entries;
create policy "own entries" on public.reality_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own vision" on public.visions;
create policy "own vision" on public.visions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own field questions" on public.field_questions;
create policy "own field questions" on public.field_questions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own orders read" on public.orders;
create policy "own orders read" on public.orders for select using (auth.uid() = user_id);

-- ========================================
-- 新用户自动建 profile
-- ========================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

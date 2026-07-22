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

-- 4c) 生命图谱提交记录：出生数据、计算出的命盘事实、免费解读、频率自测，
--     以及付费解锁后生成的完整报告（full_report 在未解锁前为 null）
create table if not exists public.life_map_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text,
  birth_input jsonb not null,
  facts jsonb not null,
  core_type_name text,
  free_narrative text,
  focus text,
  current_state text,
  energy_level int,
  clarity_level int,
  alignment_level int,
  full_report text,
  full_report_en text,
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
-- 迁移：如果 life_map_submissions 表是在 full_report_en 字段加入之前建的，
-- 这一句会把缺的字段补上（已存在则跳过，安全可重复执行）。
alter table public.life_map_submissions add column if not exists full_report_en text;

-- orders 表之前跟 life_map_submissions 表毫无关联——同一个人测过好几次
-- 生命图谱的话，从 orders 表的付款记录反查"这笔钱对应哪一份报告"，只能
-- 靠时间去猜，容易猜错。这一列直接把对应的提交记录 id 存进来，以后
-- 一眼就能对上，不用再去猜。
alter table public.orders add column if not exists submission_id uuid;
-- 这一列最初设计成外键、只指向 life_map_submissions 一张表——后来陆续
-- 加了关系共振、生命灵签、塔罗三张牌阵这些新产品，submission_id 现在
-- 可能指向好几张不同的表，外键只能绑一张表，硬指向 life_map_submissions
-- 会导致其余产品的订单，一插入就被外键校验拦下来（"创建订单失败"这个
-- 报错的真正原因）。这里把外键约束去掉，改成普通字段——数据完整性靠
-- 代码层面保证（每个产品的下单接口自己知道该存哪张表的id），不再依赖
-- 数据库外键去校验。
alter table public.orders drop constraint if exists orders_submission_id_fkey;
-- 光有 submission_id 还是要跳到另一张表才能看到名字——同一个人测试用了
-- 好几个不同的名字，光靠这一列在 orders 表里排查还是要来回切表核对。
-- 这里直接把名字也存一份进来（拿到当时的名字就够用了，不需要跟着
-- life_map_submissions 表实时同步，姓名这种字段基本不会改）。
alter table public.orders add column if not exists submission_name text;

-- ========================================
-- 灵犀关系共振图谱（合婚/合伙/合财富通用测试，$9.9）
-- ========================================
-- 两个人各自的出生信息 + 命盘数据（facts_a/facts_b，复用生命图谱同一套
-- 计算引擎，不是另外发明一套），加上AI生成的关系共振报告全文。
create table if not exists public.relationship_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name_a text not null,
  name_b text not null,
  birth_input_a jsonb not null,
  birth_input_b jsonb not null,
  facts_a jsonb not null,
  facts_b jsonb not null,
  relationship_type text default 'romantic', -- 'romantic' | 'business' | 'general'——同一套计算，只是报告的AI提示词侧重点不同
  full_report text,
  full_report_en text,
  created_at timestamptz default now()
);
alter table public.relationship_submissions enable row level security;
drop policy if exists "own relationship submissions" on public.relationship_submissions;
create policy "own relationship submissions" on public.relationship_submissions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4d) 修炼心得记录——用户日常修炼（量子息法/直觉丹道/归零心诀/上升心经，
--     或不归于某一项练习的一般心得）的私人笔记，纯粹是"我的记录"，
--     不调用AI、不生成任何解读，只是替代手机备忘录的一个更贴合场域视觉的地方。
create table if not exists public.practice_journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  practice text,               -- 'breath' | 'intuition' | 'heart-reset' | 'ascending-heart' | null（不归于某一项具体练习）
  content text not null,
  created_at timestamptz default now()
);
alter table public.practice_journal_entries enable row level security;
drop policy if exists "own practice journal entries" on public.practice_journal_entries;
create policy "own practice journal entries" on public.practice_journal_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4e) 摇签 · 意识占卜（$9.9付费产品）——三支签的干支索引是从命盘四柱
--     确定性算出来的（见 lib/qian-draw.ts），不是随机摇的，存下来是
--     为了同一份提交不用每次重新算+重新调场域解读。
create table if not exists public.qian_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text,
  birth_input jsonb not null,
  facts jsonb not null,
  sign_indexes int[] not null,
  full_report text,
  full_report_en text,
  created_at timestamptz default now()
);
alter table public.qian_submissions enable row level security;
drop policy if exists "own qian submissions" on public.qian_submissions;
create policy "own qian submissions" on public.qian_submissions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4f) 灵犀量子塔罗 · 三张牌阵深度解读（$9.9付费产品）——隐藏模式/
--     当下共振/未来方向三张牌的索引，从命盘四柱确定性算出来的
--     （见 lib/tarot-spread.ts），不是随机抽的。
create table if not exists public.tarot_reading_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text,
  birth_input jsonb not null,
  facts jsonb not null,
  hidden_index int not null,
  present_index int not null,
  future_index int not null,
  full_report text,
  full_report_en text,
  created_at timestamptz default now()
);
alter table public.tarot_reading_submissions enable row level security;
drop policy if exists "own tarot reading submissions" on public.tarot_reading_submissions;
create policy "own tarot reading submissions" on public.tarot_reading_submissions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.life_map_submissions enable row level security;
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

drop policy if exists "own life map submissions" on public.life_map_submissions;
create policy "own life map submissions" on public.life_map_submissions
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

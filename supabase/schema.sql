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
-- 多维叙事年解锁、全构造解锁这两个产品改成订阅制之后，需要各自能记录
-- 一个到期时间（不能跟"显化与梦境解读"共用profiles.manifest_until
-- 那一个字段，那样会互相覆盖）。这一列留空就是永久解锁（原来的行为
-- 不变），有值就是订阅到期时间。
alter table public.unlocks add column if not exists expires_at timestamptz;

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
alter table public.orders add column if not exists amount_rmb numeric;

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

-- ========================================
-- v298：合并整理——以下几张表之前只存在于各自独立的
-- SQL-v225/v226/v228/v237/v245 文件里，从未被并进这份总表结构。
-- 结果是本文件的头部注释("若已执行过旧版，本文件可重复执行")其实
-- 不成立——一个全新环境只跑这份 schema.sql，会缺生命韧性/桃花磁场/
-- 今日运势潮汐/财富创造地图这四个产品的提交表，以及限流、今日运势
-- AI正文缓存这两张支撑表。现在把它们全部合并进来，之前独立的
-- SQL-v225/226/228/237/245/261/262 六个文件内容已完整覆盖，可以
-- 归档。
-- ========================================

-- 生命韧性指数 · 完整档案
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

-- 桃花磁场指数 · 完整档案
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

-- 今日运势潮汐 · 深度报告
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

-- 财富创造地图 · 完整档案
create table if not exists public.wealth_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text,
  facts jsonb not null,
  full_report text,
  full_report_en text,
  created_at timestamptz default now()
);
-- v261/v262：建表时漏了这一列，保存接口一直在写这个字段，导致
-- "Could not find the 'birth_input' column" 报错。
alter table public.wealth_submissions add column if not exists birth_input jsonb;
alter table public.wealth_submissions enable row level security;
drop policy if exists "own wealth submissions" on public.wealth_submissions;
create policy "own wealth submissions" on public.wealth_submissions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- v225：全站接口限流用的计数表 + 校验函数
create table if not exists public.rate_limits (
  id text primary key,
  window_start timestamptz not null default now(),
  count integer not null default 0
);

create or replace function public.rate_limit_check(p_key text, p_limit int, p_window_seconds int)
returns boolean
language plpgsql
as $$
declare
  v_count int;
begin
  insert into public.rate_limits (id, window_start, count)
  values (p_key, now(), 1)
  on conflict (id) do update
    set count = case
          when rate_limits.window_start < now() - (p_window_seconds || ' seconds')::interval
            then 1
          else rate_limits.count + 1
        end,
        window_start = case
          when rate_limits.window_start < now() - (p_window_seconds || ' seconds')::interval
            then now()
          else rate_limits.window_start
        end
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;

-- v226：今日运势 AI 正文缓存——同一天同一星座只生成一次
create table if not exists public.daily_fortune_cache (
  id text primary key,       -- 格式：YYYY-MM-DD_星座slug，中文正文额外带 _en 后缀区分英文版
  content text not null,
  created_at timestamptz not null default now()
);
-- 可选：定期清掉超过30天的旧缓存（不是必须，表本身很小）：
-- delete from public.daily_fortune_cache where created_at < now() - interval '30 days';

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

-- Security hardening: internal service-only tables and RPC
alter table public.rate_limits enable row level security
;
alter table public.daily_fortune_cache enable row level security
;
revoke all on table public.rate_limits from anon, authenticated
;
revoke all on table public.daily_fortune_cache from anon, authenticated
;
revoke execute on function public.rate_limit_check(text, integer, integer) from public, anon, authenticated
;
grant execute on function public.rate_limit_check(text, integer, integer) to service_role
;

-- RLS ownership filters and payment callbacks depend on these indexes at scale
create index if not exists orders_provider_payment_id_idx on public.orders (provider_payment_id)
;
create index if not exists orders_user_id_idx on public.orders (user_id)
;
create index if not exists life_map_submissions_user_id_idx on public.life_map_submissions (user_id)
;
create index if not exists relationship_submissions_user_id_idx on public.relationship_submissions (user_id)
;
create index if not exists resilience_submissions_user_id_idx on public.resilience_submissions (user_id)
;
create index if not exists romance_submissions_user_id_idx on public.romance_submissions (user_id)
;
create index if not exists daily_tide_submissions_user_id_idx on public.daily_tide_submissions (user_id)
;
create index if not exists wealth_submissions_user_id_idx on public.wealth_submissions (user_id)
;
create index if not exists qian_submissions_user_id_idx on public.qian_submissions (user_id)
;
create index if not exists tarot_reading_submissions_user_id_idx on public.tarot_reading_submissions (user_id)
;

-- Atomic payment fulfillment prevents duplicate entitlement extension under concurrent callbacks
create or replace function public.fulfill_paid_order(p_order_id uuid, p_days integer)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype
;
  v_now timestamptz := now()
;
  v_until timestamptz
;
begin
  if p_days < 1 or p_days > 3650 then
    return jsonb_build_object('ok', false, 'error', 'invalid_duration')
;
  end if
;

  select * into v_order from public.orders where id = p_order_id for update
;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'order_not_found')
;
  end if
;
  if v_order.status = 'paid' then
    return jsonb_build_object('ok', true, 'alreadyPaid', true)
;
  end if
;

  if v_order.product_type = 'permanent' then
    insert into public.unlocks (user_id, product_id, expires_at)
    values (v_order.user_id, v_order.product_id, null)
    on conflict (user_id, product_id) do update set expires_at = null
;
    if v_order.product_id = 'bundle' then
      insert into public.unlocks (user_id, product_id, expires_at)
      select v_order.user_id, product_id, null
      from unnest(array['breath', 'intuition', 'heart-reset', 'ascending-heart']) product_id
      on conflict (user_id, product_id) do update set expires_at = null
;
    end if
;
  elsif v_order.product_id = any(array['day', 'month', 'year']) then
    update public.profiles
    set manifest_until = greatest(coalesce(manifest_until, v_now), v_now) + make_interval(days => p_days)
    where id = v_order.user_id
;
    if not found then raise exception 'profile_not_found'
;
    end if
;
  else
    select greatest(coalesce(expires_at, v_now), v_now)
    into v_until from public.unlocks
    where user_id = v_order.user_id and product_id = v_order.product_id
    for update
;
    v_until := coalesce(v_until, v_now) + make_interval(days => p_days)
;
    insert into public.unlocks (user_id, product_id, expires_at)
    values (v_order.user_id, v_order.product_id, v_until)
    on conflict (user_id, product_id) do update
    set expires_at = greatest(coalesce(public.unlocks.expires_at, v_now), v_now) + make_interval(days => p_days)
;
  end if
;

  update public.orders set status = 'paid', paid_at = v_now where id = p_order_id
;
  return jsonb_build_object('ok', true, 'alreadyPaid', false)
;
end
;
$$
;

revoke execute on function public.fulfill_paid_order(uuid, integer) from public, anon, authenticated
;
grant execute on function public.fulfill_paid_order(uuid, integer) to service_role
;

-- WeChat Mini Program identity and virtual-payment audit tables (v267).
create table if not exists public.wechat_mini_identities (
  openid text primary key,
  unionid text,
  user_id uuid not null references auth.users(id) on delete cascade,
  encrypted_session_key text not null,
  session_key_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists wechat_mini_identity_user_idx on public.wechat_mini_identities (user_id);
create index if not exists wechat_mini_identity_unionid_idx on public.wechat_mini_identities (unionid) where unionid is not null;

create table if not exists public.wechat_mini_sessions (
  token_hash text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  openid text not null references public.wechat_mini_identities(openid) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);
create index if not exists wechat_mini_sessions_user_idx on public.wechat_mini_sessions (user_id);
create index if not exists wechat_mini_sessions_expiry_idx on public.wechat_mini_sessions (expires_at);

create table if not exists public.wechat_mini_payment_events (
  id bigserial primary key,
  event_type text not null,
  out_trade_no text,
  order_id uuid references public.orders(id) on delete set null,
  transaction_id text,
  payload jsonb not null,
  handled boolean not null default false,
  created_at timestamptz not null default now(),
  unique (event_type, out_trade_no, transaction_id)
);
alter table public.wechat_mini_identities enable row level security;
alter table public.wechat_mini_sessions enable row level security;
alter table public.wechat_mini_payment_events enable row level security;
revoke all on table public.wechat_mini_identities, public.wechat_mini_sessions, public.wechat_mini_payment_events from anon, authenticated;
grant all on table public.wechat_mini_identities, public.wechat_mini_sessions, public.wechat_mini_payment_events to service_role;
grant usage, select on sequence public.wechat_mini_payment_events_id_seq to service_role;
alter table public.orders add column if not exists channel text;
create unique index if not exists orders_provider_payment_unique_idx on public.orders (provider, provider_payment_id) where provider_payment_id is not null;

-- Paid report rows are written only by authenticated server routes
revoke insert, update, delete on table public.life_map_submissions, public.relationship_submissions, public.resilience_submissions, public.romance_submissions, public.daily_tide_submissions, public.wealth_submissions, public.qian_submissions, public.tarot_reading_submissions from anon, authenticated
;
grant select on table public.life_map_submissions, public.relationship_submissions, public.resilience_submissions, public.romance_submissions, public.daily_tide_submissions, public.wealth_submissions, public.qian_submissions, public.tarot_reading_submissions to authenticated
;

-- v314: Mini Program's independent Copernican Dendrite assessment archive.
-- It is deliberately separate from the web astronomical submission tables.
create table if not exists public.mini_dendrite_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id text not null check (product_id in ('life-map-report','relationship-resonance','resilience-report','romance-report','wealth-report','daily-tide-report','tarot-reading','qian-reading','life-archetype')),
  input jsonb not null,
  result jsonb not null,
  algorithm_version text not null default 'copernican-dendrite-v1',
  created_at timestamptz not null default now()
);
create index if not exists mini_dendrite_assessments_user_created_idx on public.mini_dendrite_assessments (user_id, created_at desc);
create index if not exists mini_dendrite_assessments_user_product_idx on public.mini_dendrite_assessments (user_id, product_id, created_at desc);
alter table public.mini_dendrite_assessments enable row level security;
drop policy if exists "own mini dendrite assessments read" on public.mini_dendrite_assessments;
create policy "own mini dendrite assessments read" on public.mini_dendrite_assessments for select using (auth.uid() = user_id);
revoke insert, update, delete on table public.mini_dendrite_assessments from anon, authenticated;
grant select on table public.mini_dendrite_assessments to authenticated;

-- v301: explicit Mini Program <-> existing web account connection.
-- Keep this in the canonical schema as well as SQL-v301 so a new environment
-- gets the same secure account-link capability in one pass.
create or replace function public.link_mini_identity_to_account(p_openid text, p_source_user_id uuid, p_target_user_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_identity_user_id uuid; v_target_openid text; v_source_manifest_until timestamptz; v_target_manifest_until timestamptz;
  v_order_count integer := 0; v_report_count integer := 0; v_rows integer := 0;
begin
  if p_source_user_id = p_target_user_id then return jsonb_build_object('ok', true, 'alreadyLinked', true); end if;
  select user_id into v_identity_user_id from public.wechat_mini_identities where openid = p_openid for update;
  if v_identity_user_id is null or v_identity_user_id <> p_source_user_id then raise exception 'mini identity does not match source account'; end if;
  select openid into v_target_openid from public.wechat_mini_identities where user_id = p_target_user_id;
  if v_target_openid is not null and v_target_openid <> p_openid then raise exception 'target account already has another mini identity'; end if;
  select manifest_until into v_source_manifest_until from public.profiles where id = p_source_user_id;
  select manifest_until into v_target_manifest_until from public.profiles where id = p_target_user_id;
  insert into public.profiles (id, manifest_until) values (p_target_user_id, greatest(v_source_manifest_until, v_target_manifest_until))
  on conflict (id) do update set manifest_until = greatest(excluded.manifest_until, public.profiles.manifest_until);
  insert into public.unlocks (user_id, product_id, expires_at) select p_target_user_id, product_id, expires_at from public.unlocks where user_id = p_source_user_id
  on conflict (user_id, product_id) do update set expires_at = case when public.unlocks.expires_at is null or excluded.expires_at is null then null else greatest(public.unlocks.expires_at, excluded.expires_at) end;
  delete from public.unlocks where user_id = p_source_user_id;
  update public.orders set user_id = p_target_user_id where user_id = p_source_user_id; get diagnostics v_order_count = row_count;
  update public.life_map_submissions set user_id = p_target_user_id where user_id = p_source_user_id; get diagnostics v_report_count = row_count;
  update public.relationship_submissions set user_id = p_target_user_id where user_id = p_source_user_id; get diagnostics v_rows = row_count; v_report_count := v_report_count + v_rows;
  update public.qian_submissions set user_id = p_target_user_id where user_id = p_source_user_id; get diagnostics v_rows = row_count; v_report_count := v_report_count + v_rows;
  update public.tarot_reading_submissions set user_id = p_target_user_id where user_id = p_source_user_id; get diagnostics v_rows = row_count; v_report_count := v_report_count + v_rows;
  update public.resilience_submissions set user_id = p_target_user_id where user_id = p_source_user_id; get diagnostics v_rows = row_count; v_report_count := v_report_count + v_rows;
  update public.romance_submissions set user_id = p_target_user_id where user_id = p_source_user_id; get diagnostics v_rows = row_count; v_report_count := v_report_count + v_rows;
  update public.daily_tide_submissions set user_id = p_target_user_id where user_id = p_source_user_id; get diagnostics v_rows = row_count; v_report_count := v_report_count + v_rows;
  update public.wealth_submissions set user_id = p_target_user_id where user_id = p_source_user_id; get diagnostics v_rows = row_count; v_report_count := v_report_count + v_rows;
  update public.mini_dendrite_assessments set user_id = p_target_user_id where user_id = p_source_user_id; get diagnostics v_rows = row_count; v_report_count := v_report_count + v_rows;
  update public.wechat_mini_sessions set user_id = p_target_user_id where user_id = p_source_user_id and openid = p_openid;
  update public.wechat_mini_identities set user_id = p_target_user_id, updated_at = now() where openid = p_openid;
  return jsonb_build_object('ok', true, 'ordersMoved', v_order_count, 'reportsMoved', v_report_count);
end;
$$;
revoke execute on function public.link_mini_identity_to_account(text, uuid, uuid) from public, anon, authenticated;
grant execute on function public.link_mini_identity_to_account(text, uuid, uuid) to service_role;

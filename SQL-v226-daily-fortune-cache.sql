-- 灵犀 v226 · 今日运势 AI 正文缓存配套 SQL
-- 在 Supabase 项目的 SQL Editor 里执行一次即可，之后不用再跑。
-- （上一版 v225 的 SQL-v225-rate-limit.sql 如果还没跑，也需要跑一次，
-- 两份互相独立，不冲突。）

create table if not exists daily_fortune_cache (
  id text primary key,       -- 格式：YYYY-MM-DD_星座slug（例如 2026-07-27_capricorn），中文正文额外带 _en 后缀区分英文版
  content text not null,
  created_at timestamptz not null default now()
);

-- 可选：定期清掉超过30天的旧缓存，避免这张表无限增长（不是必须，
-- 表本身很小，不清理也不影响功能，只是长期累积的行数会变多）。
-- 如果想要，可以在 Supabase 的 SQL Editor 里手动跑，或设成一个
-- 定时任务：
-- delete from daily_fortune_cache where created_at < now() - interval '30 days';

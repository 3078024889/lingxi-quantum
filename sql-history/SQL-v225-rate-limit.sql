-- 灵犀 v225 · 限流功能配套 SQL
-- 在 Supabase 项目的 SQL Editor 里执行一次即可，之后不用再跑。

create table if not exists rate_limits (
  id text primary key,
  window_start timestamptz not null default now(),
  count integer not null default 0
);

create or replace function rate_limit_check(p_key text, p_limit int, p_window_seconds int)
returns boolean
language plpgsql
as $$
declare
  v_count int;
begin
  insert into rate_limits (id, window_start, count)
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

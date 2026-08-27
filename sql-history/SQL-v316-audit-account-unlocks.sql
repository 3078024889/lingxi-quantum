-- V316 · 指定审查账户的九项场域报告永久权限
-- 目标仅限 945462373@qq.com；可重复执行，不创建订单、不影响其他用户。
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id
  from auth.users
  where lower(email) = lower('945462373@qq.com')
  limit 1;

  if v_user_id is null then
    raise exception 'Audit account not found: 945462373@qq.com';
  end if;

  insert into public.unlocks (user_id, product_id, expires_at)
  select v_user_id, product_id, null
  from unnest(array[
    'life-map-report',
    'relationship-resonance',
    'resilience-report',
    'romance-report',
    'wealth-report',
    'daily-tide-report',
    'tarot-reading',
    'qian-reading',
    'life-archetype'
  ]) as product_id
  on conflict (user_id, product_id) do update set expires_at = null;

  raise notice 'Granted nine permanent report entitlements to user %', v_user_id;
end $$;

select u.email, x.product_id, x.expires_at
from public.unlocks x
join auth.users u on u.id = x.user_id
where lower(u.email) = lower('945462373@qq.com')
  and x.product_id = any(array[
    'life-map-report','relationship-resonance','resilience-report',
    'romance-report','wealth-report','daily-tide-report',
    'tarot-reading','qian-reading','life-archetype'
  ])
order by x.product_id;

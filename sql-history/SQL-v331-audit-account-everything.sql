-- V331 · 指定审查账户永久全域权限（当前及未来全部付费内容）
-- 目标仅限 945462373@qq.com；幂等执行，不创建订单，不影响其他账户。
insert into public.unlocks (user_id, product_id, expires_at)
select id, 'everything', null
from auth.users
where lower(email) = lower('945462373@qq.com')
on conflict (user_id, product_id) do update set expires_at = null;

select u.email, x.product_id, x.expires_at
from public.unlocks x
join auth.users u on u.id = x.user_id
where lower(u.email) = lower('945462373@qq.com')
  and x.product_id = 'everything';

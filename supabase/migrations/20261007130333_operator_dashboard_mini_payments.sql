create or replace function public.operator_dashboard_snapshot(
 p_days integer default 30, p_order_page integer default 0, p_user_page integer default 0,
 p_search text default '', p_provider text default 'all', p_status text default 'all'
) returns jsonb language sql stable security definer set search_path = '' as $$
with params as (
 select greatest(1,least(90,coalesce(p_days,30))) days,
 greatest(0,least(100000,coalesce(p_order_page,0))) op,
 greatest(0,least(100000,coalesce(p_user_page,0))) up,
 lower(left(trim(coalesce(p_search,'')),120)) term,
 (now() at time zone 'Asia/Shanghai')::date today
), orders as (
 select o.*,u.email,q.tool_id,
 case when o.currency in ('CNY','USD') then o.currency
 when o.product_id like '%usd-balance-%' or o.provider='paypal' then 'USD'
 when o.provider in ('wechat','alipay','wechat_mini_virtual') or o.product_id like 'ai-balance-%' then 'CNY'
 else 'UNKNOWN' end as money_currency,
 (o.product_id like '%balance-%' and o.product_id not like 'toolquote:%') as is_topup
 from public.orders o left join auth.users u on u.id=o.user_id
 left join public.tool_payment_quotes q on o.product_id='toolquote:'||q.id::text
), priced as (
 select o.*,case money_currency when 'CNY' then amount_rmb when 'USD' then amount_usd else null end amount
 from orders o
), filtered as (
 select o.* from priced o cross join params p
 where (p_provider='all' or o.provider=p_provider) and (p_status='all' or o.status=p_status)
 and (p.term='' or strpos(lower(coalesce(o.email,'')||' '||o.id::text||' '||o.user_id::text||' '||coalesce(o.tool_id,'')||' '||coalesce(o.product_id,'')),p.term)>0)
), people as (
 select u.id,u.email,u.created_at,u.last_sign_in_at,(u.email_confirmed_at is not null) confirmed,
 (select count(*) from public.orders o where o.user_id=u.id) order_count
 from auth.users u cross join params p
 where u.deleted_at is null and not coalesce(u.is_anonymous,false)
 and (p.term='' or strpos(lower(coalesce(u.email,'')||' '||u.id::text),p.term)>0)
), visits as (
 select v.*,(v.occurred_at at time zone 'Asia/Shanghai')::date as day
 from public.site_page_views v cross join params p
 where v.occurred_at >= ((p.today-p.days+1)::timestamp at time zone 'Asia/Shanghai')
), activity as (
 (select 'payment' kind,o.id,o.email,o.paid_at at,o.money_currency currency,o.amount,o.provider,o.tool_id,o.product_id
 from priced o where o.status='paid' order by o.paid_at desc nulls last,o.id limit 25)
 union all
 (select 'registration',u.id,u.email,u.created_at,null,null,null,null,null
 from auth.users u where u.deleted_at is null and not coalesce(u.is_anonymous,false) order by u.created_at desc,u.id limit 25)
)
select jsonb_build_object(
 'summary',jsonb_build_object(
 'users',(select count(*) from auth.users where deleted_at is null and not coalesce(is_anonymous,false)),
 'new_users_today',(select count(*) from auth.users cross join params p where deleted_at is null and not coalesce(is_anonymous,false) and created_at >= (p.today::timestamp at time zone 'Asia/Shanghai')),
 'orders',(select count(*) from public.orders),
 'paid_orders',(select count(*) from public.orders where status='paid'),
 'money',(select coalesce(jsonb_agg(x),'[]'::jsonb) from (
 select c.currency,
 coalesce(sum(o.amount) filter(where o.provider in ('wechat','alipay','paypal','wechat_mini_virtual')),0) cash_received,
 coalesce(sum(o.amount) filter(where o.is_topup and o.provider in ('wechat','alipay','paypal','wechat_mini_virtual')),0) topups,
 coalesce(sum(o.amount) filter(where not o.is_topup and o.provider in ('wechat','alipay','paypal','wechat_mini_virtual')),0) direct_sales,
 coalesce(sum(o.amount) filter(where o.provider='sasi-balance'),0) balance_orders
 from (values ('CNY'),('USD')) c(currency) left join priced o on o.money_currency=c.currency and o.status='paid' group by c.currency
 ) x)),
 'orders',(select coalesce(jsonb_agg(x),'[]'::jsonb) from (
 select id,user_id,email,product_id,tool_id,money_currency currency,amount,status,provider,provider_payment_id,created_at,paid_at,is_topup
 from filtered order by created_at desc,id limit 25 offset (select op*25 from params)) x),
 'order_total',(select count(*) from filtered),
 'users',(select coalesce(jsonb_agg(x),'[]'::jsonb) from (select * from people order by created_at desc,id limit 25 offset (select up*25 from params)) x),
 'user_total',(select count(*) from people),
 'activity',(select coalesce(jsonb_agg(x),'[]'::jsonb) from (select * from activity order by at desc nulls last,id limit 25) x),
 'traffic',jsonb_build_object(
 'started_at',(select min(occurred_at) from public.site_page_views),
 'views',(select count(*) from visits),
 'sessions',(select count(distinct session_hash) from visits),
 'today_views',(select count(*) from visits cross join params p where day=p.today),
 'daily',(select jsonb_agg(x) from (select d::date as day,count(v.id) views,count(distinct v.session_hash) sessions from params p cross join lateral generate_series(p.today-p.days+1,p.today,'1 day'::interval) d left join visits v on v.day=d::date group by d order by d) x),
 'pages',(select coalesce(jsonb_agg(x),'[]'::jsonb) from (select path,count(*) views from visits group by path order by count(*) desc,path limit 10) x),
 'sources',(select coalesce(jsonb_agg(x),'[]'::jsonb) from (select referrer_host source,count(*) views from visits group by referrer_host order by count(*) desc,referrer_host limit 10) x),
 'hosts',(select coalesce(jsonb_agg(x),'[]'::jsonb) from (select host,count(*) views from visits group by host order by count(*) desc) x),
 'devices',(select coalesce(jsonb_agg(x),'[]'::jsonb) from (select device,count(*) views from visits group by device order by count(*) desc) x)
 )
);
$$;
revoke all on function public.operator_dashboard_snapshot(integer,integer,integer,text,text,text) from public,anon,authenticated;
grant execute on function public.operator_dashboard_snapshot(integer,integer,integer,text,text,text) to service_role;

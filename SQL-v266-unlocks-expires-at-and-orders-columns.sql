-- v266：紧急修复——unlocks 表缺 expires_at 列
--
-- 真实报错（来自你刚才的截图）：
--   支付已确认到账，但解锁时出现问题：
--   订阅解锁写入失败：Could not find the 'expires_at' column of
--   'unlocks' in the schema cache
--
-- 这是本轮目前为止最严重的一个问题：钱已经到账，但因为 unlocks 表缺
-- 这一列，订阅类解锁（多维叙事单篇/年度解锁、显化订阅、全构造解锁）
-- 写不进去，订单永远卡在"待支付"状态，账户页点"查询"重试也会一直
-- 失败——不是重试的问题，是这张表从一开始就缺这一列。
--
-- 这条 SQL 在 supabase/schema.sql 里其实一直都在（第25行），但从来
-- 没有被单独抽成一份 SQL-vXXX 文件让你单独执行过，等于一直没有真的
-- 跑到你的 Supabase 项目里。这次单独抽出来，跟另外几条同样情况的
-- 列一起，一次性补齐。

alter table public.unlocks add column if not exists expires_at timestamptz;
alter table public.life_map_submissions add column if not exists full_report_en text;
alter table public.orders add column if not exists submission_id uuid;
alter table public.orders add column if not exists submission_name text;
alter table public.orders add column if not exists amount_rmb numeric;

-- 跑完这条之后：
-- 1. 去「场域入口 → 场域订单」，找到那笔"瞬间之重"待支付订单，点
--    「查询」重新确认一次——不用重新付款，这次应该会直接变成"已支付"
--    并跳转解锁，因为钱本来就已经到账了，卡住的只是这一步写入。
-- 2. 如果查询之后还是失败，把新的报错原文发我，我再往下查。

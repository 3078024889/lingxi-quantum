-- v262：修复财富创造地图提交报错
--   PGRST204: Could not find the 'birth_input' column of 'wealth_submissions'
-- 代码在 app/api/wealth/save/route.ts 里往 wealth_submissions 写 birth_input
-- 字段（保存用户原始填写的出生资料，后续生成完整报告要用到这个原始输入，
-- 不只是存计算完的结果），但建表当时漏了这一列。用 IF NOT EXISTS，
-- 已经手动加过的话重复执行这条也不会报错。

alter table wealth_submissions
  add column if not exists birth_input jsonb;

-- 说明：工程里其实已经有一份 SQL-v261-fix-wealth-birth-input.sql，
-- 内容和这条完全一样——上一轮已经诊断对了根因、也写好了修复SQL，
-- 只是没有被实际执行过（Supabase 那边这张表现在应该还是没有这一列，
-- 不然不会一直报同一个错）。这份 v262 版本是同一条修复，换个文件名
-- 方便你确认这次真的跑过。跑完这一条之后，v261 那份可以不用管，
-- 两份不会冲突（都是 add column if not exists，重复执行是安全的）。

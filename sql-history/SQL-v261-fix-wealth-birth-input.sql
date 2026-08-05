-- 灵犀 v261 · 修复：wealth_submissions 表缺少 birth_input 列
-- 真实报错：PGRST204: Could not find the 'birth_input' column of
-- 'wealth_submissions' in the schema cache
-- 原因：写财富创造地图的保存接口时，照抄了生命韧性那套代码结构
-- （会存 birth_input 这个字段），但当时给财富创造地图写的 SQL
-- 表结构，漏掉了这一列——不是环境问题，是我当时的疏漏。
-- 在 Supabase 项目的 SQL Editor 里执行一次即可，不会影响已有数据。

alter table public.wealth_submissions add column if not exists birth_input jsonb;

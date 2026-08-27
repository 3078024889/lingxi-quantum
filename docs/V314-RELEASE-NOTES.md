# v314 / Mini Program 1.6 release notes

## Recommended upload note

`1.6：新增生命原型与九产品树突精测；支持中英双语、转发分享、复制官网链接；官网七类出生资料新增阳历/农历选择与合规说明；新增小程序树突档案、PDF出版及安全账户迁移。`

## Required database step

Before deploying the website APIs or uploading the Mini Program, run this once in Supabase SQL Editor:

`sql-history/SQL-v314-mini-dendrite-assessments.sql`

It creates `mini_dendrite_assessments`, its indexes/RLS policy, and replaces the explicit account-link RPC so new native reports move safely when a user links an existing Lingxi web account.

In the WeChat Virtual Payment console, add and publish the new goods ID `rpt_archetype` at the same configured price as the other report products before testing payment. The remaining eight SKU IDs are unchanged.

## Product structure

1. 生命图谱
2. 关系共振
3. 生命韧性指数
4. 桃花磁场指数
5. 财富创造地图
6. 今日潮汐
7. 灵犀量子生命镜像
8. 灵犀生命灵签
9. 生命原型（八域汇流产品）

Website products use astronomical and calendrical calculations. The Mini Program uses the deterministic Lingxifield Dendritic Knowledge Network. Public bilingual notices explain the difference in both clients.

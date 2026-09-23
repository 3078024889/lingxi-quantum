# V11.71 · Production Migration History Sync

生产数据库已经实际应用并 postflight 验证了 SASI cognitive/runtime、工具支付恢复、视频去水印定价和 least-privilege hardening。

本包的任务不是再次执行生产 SQL，而是让本地仓库 migration 文件名与 Supabase **实际 migration version** 对齐，避免未来 CLI 将已经应用的迁移再次识别为“未执行”。

## 已验证的生产结果

- V10.20–V11.10 cognitive/runtime 表均存在。
- SASI server-only 表：authenticated 无 SELECT/INSERT/UPDATE/DELETE。
- owner-read 表：authenticated 只有 SELECT，写入仍由 service role。
- 视频去水印生产价格：¥1.20 / minute，min ¥1.20，cap ¥49。
- `repair_tool_paid_grant`：authenticated 不可执行；service_role/postgres 可执行。
- 新 SASI owner RLS policy 已改为 `(select auth.uid())`，降低 initplan 开销。
- 新 cognitive 外键已增加覆盖索引。

## 尚未自动处理的两项安全配置

1. `create_sasi_project(...)` 仍是 authenticated 可调用的 SECURITY DEFINER RPC。
   GitHub main 搜索没有找到直接调用，但本地仓库目前很脏，因此 V11.71 先要求本地静态扫描，确认没有依赖后再撤销。

2. Supabase leaked-password protection 仍未开启。
   这属于 Auth 项目设置，不通过 SQL migration 擅自改变。

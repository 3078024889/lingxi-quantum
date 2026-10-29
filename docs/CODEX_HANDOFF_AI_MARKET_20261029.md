# CODEX 接管书 — LINGXIFIELD AI Market A–H
日期：2026-10-29。目标：实物可见、可登录、可测试、真实数据、九语言、交易安全、低内存，全项闭环。**这不是已通过的生产验收单**。

## 0. 用户首先想看见网站，并恢复管理员账户登录
用户访问本地 `localhost:3100` 看到 `/account?auth_error=origin`，管理员无法登录。此前四个 `127.0.0.1:3100/ai-market*` HTTP 路由均返回 200；该事实**无法证明登录正常**。优先诊断 auth callback / allowed origin / redirect、localhost 与 127.0.0.1 差异、NEXT_PUBLIC_SITE_URL / NEXT_PUBLIC_APP_URL、Supabase redirect allowlist、OAuth/email callback、Cookie Domain / Secure / SameSite、`x-forwarded-host`、本地环境配置与浏览器 session。不要修改生产域名安全策略来放开所有 origin，不要关闭 CSRF 或 OAuth state 校验；不要在对话/仓库打印管理员密码、tokens、session、service_role key。测试应包含已登录管理员权限/未登录访问/普通用户不得越权。先确认 `/account?auth_error=origin` 是谁构造的 redirect；找到代码后用最小修复和回归测试。若需要正式 Supabase 授权或用户真实登录，记录阻碍并要求用户自己完成登录；不得冒称已修复。将 AI 行情入口及九语言页面纳入 UI 导航，让用户实际看到新页面。

## 1. 工程位置与安全边界
仓库：`3078024889/lingxi-quantum`; A–H feature branch: `feature/ai-market-review-gate-20261029`。
本机主仓库：`D:\30780\lingxi-quantum`；独立验收 worktree：`D:\30780\lingxi-ai-market-acceptance-ah`，当前 detached HEAD 至 `c6fc3290`（用户输出）。
旧 demo 双层目录：`D:\30780\lingxi-quantum\lingxifield-ai-market-demo\lingxifield-ai-market-demo`，**不能误当 A–H 完整源码**。
验收 V2：`D:\30780\lingxi-quantum\LINGXIFIELD_AH_FREE_ACCEPTANCE_V2`。
浏览器缓存：`D:\30780\playwright-browsers`；`$env:PLAYWRIGHT_BROWSERS_PATH='D:\30780\playwright-browsers'`。缓存与测试报告存 D:，避免占满 C:。
保留 D 盘所有项目，绝不格式化、清盘、删除分区、git reset --hard / clean -fd；所有功能先隔离 feature 分支，统一验收后待用户许可合并 main，不自动部署、收款、生产迁移。用户现有正式 Supabase 项目 `sxsgdpqojepgbbrxrzlq` 有 196 public tables、103 auth users、0 ai_market_*，现有 main branch 标记 MIGRATIONS_FAILED。**严禁对正式数据库执行新 A–H SQL。** 用户明确拒绝新增付费资源，使用 D 盘免费隔离 DB / CI / Playwright。

## 2. 已真实执行通过（用户返回的日志）
- Core A–H unit suite：PASS 0 fail（详见本地 V2 报告）。
- 15/15 专项 `live-hub.test.mjs` + `integration-contracts.test.mjs`：PASS。
- TypeScript `pnpm exec tsc --noEmit`：PASS。
- Next.js 15.5.27 `pnpm build`：PASS，所有页面路由生成输出结束。
- 9/9 Playwright mobile smoke：zh,en,ja,ko,fr,de,es,pt,ar，`failures: []`，范围仅页面响应、lang、RTL、390px 溢出、基础文本；**不是全功能 i18n E2E**。
- 本地 GET `/ai-market`, `/ai-market/lang/zh`, `/ai-market/lang/en`, `/ai-market/lang/ar`：4/4 HTTP 200，local-runtime-probe ok:true，`memoryLimitVerified:false`。
- 本地 SQL 安全探针静态契约 `local-db-security-probe.test.mjs`：1/1 PASS，**并未真实迁移 DB**。
- Hugging Face candidate tests：4/4 PASS（旧版本），但真实 API 请求失败。

## 3. 当前必须修复的明确错误
A) 管理员登录失败：`localhost:3100/account?auth_error=origin`，浏览器页面错误。定位 callback redirect 生成点 + 原因，修复本地测试用的 origin 白名单，不放宽线上校验。**优先让用户可看到且可操作完成的平台，不要只展示源代码**。
B) 真实官方数据采集：Node v24.19.0 fetch `huggingface.co/api/models` -> `ECONNRESET` / TLS socket disconnected before secure connection；PowerShell `Invoke-WebRequest` 同网址 -> “基础连接已经关闭: 发送时发生错误”。优先调查本地 DNS、TCP 443、TLS/代理；不能假装 HF 数据已入库、不能关闭证书校验。不强依赖单一来源：设计 GitHub 官方 API/其他可许可数据独立来源+明确 provenance，不把开源项目数据冒充模型排名。
C) 网络诊断脚本 `scripts/ai-market/diagnose-network.ps1` 因 PowerShell ExecutionPolicy PSSecurityException 未运行；随后的 `explain-network-report.mjs` 因诊断 JSON 未生成而 ENOENT。应以只针对当前进程的 `Set-ExecutionPolicy -Scope Process Bypass -Force`（仅在用户信任且确认脚本内容的情况下）或 `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ...` 执行，先验证文件存在/输出文件已生成，后运行报告解析。避免全局策略改动；报告仅存 D:。诊断脚本目前 `Test-NetConnection` 可能耗时，设置合理超时/状态输出。
D) Playwright 若在 C: 默认下载，显式统一 `PLAYWRIGHT_BROWSERS_PATH` 至 D:；pnpm/npm 缓存也优先 D:，先安全移动再清理，勿删系统文件。

## 4. 源码完成但业务未闭环
- A–H schema: `supabase/migrations/20261029_ai_market_data_center_a.sql`, `_metrics_b.sql`, `_h_integration_missing_tables.sql`, `_vendor_f.sql`, `_payment_ledger_h.sql`; local/bootstrap and `run-local-db-migrations.ps1`, `local-db-security-probe.sql`. SQL 未在隔离 DB 真实执行，务必先创建仅本机/D:的可丢弃 PostgreSQL 实例、记录真实迁移日志与 RLS/GRANT 结果。Local bootstrap 只模拟最低限度 auth schema，不代表 Supabase 生产兼容性，完整验收应使用免费本地 Supabase stack（若可行）并保留证据。
- HF 候选采集 `scripts/ai-market/fetch-hf-candidates.mjs` + test，支持三次重试、D: 离线 JSON，只会产生 candidate，不会写 DB；接入审核队列、证据 SHA256、去重、来源到期、真实指标历史与排名的严格口径。用户需要 AI SEO/GEO 排名、平台品牌成立时间、官网、真实评价引用、价格/免费次数/中国大陆可用性/失败扣费；不得伪造流量和使用量，付费展示与自然排名隔离。
- 九语言现仅搜索基础/候选组件通过 smoke；需要全站 UI 词条、产品详情、行情表与走势、厂商认领、套餐、订单、各种错误、SEO metadata 以及 AR RTL 全页面/手机/桌面交互检查（不能出现英文/中文串语）；保留可商用授权、来源与未核实说明。
- 商业支付：`lib/ai-market/payment-settlement-gate.mjs` 只是 guard，`ai_market_payment_events` / refunds ledger 只是 schema；缺少 PayPal/支付宝/微信的商户签名回调验证、原子交易、幂等到账/权益开通、实测沙盒付款+退款+对账。PayPal 尚在申请，缺凭据不能宣称实测通过；不要动现有站内正式支付。
- 2GB 内存：`scripts/ai-market/local-runtime-probe.mjs` 仅 HTTP 探针，`memoryLimitVerified:false`，必须实际限制内存并记录峰值、并发/超时、容器重启/恢复。用户 Windows 旧电脑有蓝屏历史，严禁高负载并发冲击本机。
- 全功能 E2E：包括搜索按需直达、9语言导航、真实免费额度和价格、筛选趋势、对比、评论溯源、付款/退款状态、手机分享、管理后台及数据权限。
- 支付站点、新 AI 行情平台的公开 UI/URL 需要让用户亲眼看，可先本机 `http://127.0.0.1:3100/ai-market` 提供可用预览。不将 localhost 登录故障误报为 AI 行情路由失败。

## 5. Codex 下一轮优先执行顺序
1. 校正登录 origin 并完整复现管理员账户问题。查代码、修复+新增 E2E；保护真实账户和凭据。
2. 完善面向用户的首页/入口、九语言详情/行情/交互，给用户直接查看网站页面的预览链接以及实际操作方式；设计简洁，借鉴非小号的一目了然，不做密密麻麻表格。
3. 让官方数据采集不被 huggingface.co 网络错误卡死；可替代合法数据源分开署名、去重并存档，不可自我认证。
4. 免费隔离 DB 执行迁移、RLS 测试与 candidate 导入；修复实际 SQL 错误、建立审计证据。
5. 建立真实支付沙盒集成（有有效商户配置才执行）；支付权限与退款要和订单原子账本严格一致。
6. 完整九语言桌面/手机交互测试；2GB 隔离运行测试；CI 自动打包验收报告。
7. 总大包合并功能在开发分支，统一运行 gate; 未通过所有 gate 不合并 main 或部署生产。

## 6. 验收交付标准
每个阶段输出：涉及文件、commit、具体命令、实际测试结果（pass/fail/skip）、本地访问 URL/截图、证据日志路径、尚未完成的阻碍。不要把“已写代码/脚本可通过静态测试”说成“数据库已迁移/支付已成功/生产上线”。用户要完成可实用的**站点**，优先可视化验收；生产发布必须用户明确批准。

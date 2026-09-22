# V9.4 生产收口说明

## 已在生产 Supabase 执行

以下两条 migration 已经通过 Supabase 管理接口执行到生产项目：

- `20260922082751_ai_simple_balance_referrals_refunds_v94`
- `20260922083219_security_hardening_ai_tools_v94`

数据库现在已经具备：
- 纯人民币 AI 充值余额；
- 赠送额度与充值本金分账；
- AI 请求预留 / 实际结算 / 失败释放；
- 轻量 / 标准 / 高智能计费档位；
- 邀请关系；
- 单笔 AI 余额充值 >= ¥50 时，邀请人获得 10% AI 赠送额度；
- 退款申请先冻结未消费本金，避免申请后继续消费；
- 退款完成后按比例撤销邀请奖励；
- 拒付 / chargeback 可整单撤销充值和邀请奖励；
- 奖励或充值已被消费而无法完全撤回时记录 adjustment debt；
- 有 adjustment debt 的账户不能继续消耗托管 AI，后续充值 / 奖励优先抵扣欠账。

## 安全状态

新 AI 资金 RPC 均只允许 `service_role` 执行：
- `ai_wallet_snapshot`
- `reserve_ai_funds`
- `settle_ai_funds`
- `release_ai_funds`
- `credit_ai_topup`
- `request_ai_refund`
- `resolve_ai_refund`
- `reverse_ai_topup`

已额外修复：
- `handle_new_user()` mutable search_path + public execute；
- `rate_limit_check(...)` mutable search_path；
- `rls_auto_enable()` public execute；
- `tool_pricing` / `tool_events` 显式 server-only deny policy；
- `ai_topup_reversals` 显式 server-only deny policy。

Security Advisor 仍有历史项目事项：
- `create_sasi_project(...)` 为 authenticated 可执行的 SECURITY DEFINER；当前 SASI 客户端流程可能依赖它，未在没有回归测试的情况下强行撤销。
- Supabase Auth leaked-password protection 仍需在控制台启用。
- 若干旧的 server-only / mini / 苍玄表启用了 RLS 但没有 client policy；这不等于公开可读，但 Advisor 会保留 INFO。

## Provider Router

默认：
- 轻量 1×：智谱 GLM-5.3-Flash → DeepSeek → 火山
- 标准 2×：DeepSeek Flash → 智谱 → 火山
- 高智能 5×：火山 Doubao-Seed-Evolving → DeepSeek → 智谱

供应商失败会自动 fallback。
最终账单按“真正返回结果的供应商 usage”结算，不按首选供应商结算。

`/api/ai/provider-test` 已限制为管理员登录账号，不再是任意登录用户都能消耗供应商额度。

## SASI

`/sasi` 不再永久重定向到站点首页，而是重新挂载现有 `SasiWorkspace`。

工作台内部旧的 `/?view=...` 深链会迁移为 `/sasi?view=...`，避免与灵犀场公共首页混在一起。

底层既有 SASI 项目、资产、任务、作品、连接、余额等能力继续保留，不拆掉已有生产内核。

## 退款与拒付

用户退款申请必须绑定原 AI 余额充值订单。
申请时先进入 refund hold，不能在退款处理中继续使用这部分本金。

管理员 / 支付回调完成原路退款后调用 `resolve_ai_refund(..., completed)`：
- 扣减 refundable principal；
- 释放 refund hold；
- 按退款金额的 10% 撤销对应邀请奖励；
- 已经消费掉的邀请奖励会形成 adjustment debt。

整单拒付 / chargeback 调用 `reverse_ai_topup`：
- 幂等处理；
- 撤销充值；
- 撤销邀请奖励；
- 不足部分计入 adjustment debt；
- 本地订单状态标记为 `refunded`。

PayPal webhook 增加 `PAYMENT.CAPTURE.REFUNDED` 的 AI 充值撤销挂钩。
微信 / 支付宝仍应由其退款成功回调或后台退款完成流程调用同一个 server-only reversal / resolve 入口；不能只根据浏览器跳转判断退款成功。

## 生产验收边界

本补丁不会主动创建真实支付订单或扣真实资金。

“支付生产端到端验收”分为：
1. 无资金的静态 / 权限 / webhook / RPC 审计；
2. 真实支付测试：需要使用测试商户环境，或由账户所有者明确进行一笔真实小额支付。

第 1 类已完成数据库与权限部分；代码推到生产并完成 Vercel 部署后，还要执行 HTTP smoke audit。

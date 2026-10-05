# R9 SASI Trust Router

目标不是“平均轮询”，而是最大化 **用户得到有效答案的概率**，同时尽量把各免费额度用均匀。

## 路由顺序

1. 用户输入。
2. 先尝试 SASI 每日体验池。
3. 体验池按“水位均衡”选最合适的免费源，不固定一家。
4. 某源 429、超时、5xx 或空答案：记录失败、进入 cooldown，立即换下一源。
5. 成功才结算本次体验预算；失败切换不扣用户体验。
6. 体验预算用完或免费池全部不可用：
   - 用户已连接智能服务 → 无缝转自己的连接；
   - 用户没有连接 → 返回 `needs-connection`，UI 显示人类文案，不显示 Provider/API 错误。
7. 资料问答还有 deterministic grounded fallback，所以即便外部模型全部不可用，也能给基于原文的可用结果，不出现“发送失败”。

## 为什么不是 Round Robin

Round Robin 会浪费小额度，并把流量送给正在限流或质量较差的源。

R9 分数综合：
- 当前相对使用水位 `requestCount / dailyShare`
- 最近成功率
- 最近延迟 EWMA
- 质量权重
- 速度权重
- 任务匹配
- cooldown

优先把流量给“还没用够自己份额、健康、快、适合当前任务”的源。

## 信任原则

前台不显示：
- Provider 名称
- Model 名称
- 429
- quota exceeded
- timeout
- token
- fallback 次数

前台只看到：
- 正常结果；
- 或体验用完后“连接我的智能服务”的自然提示。

## 数据库

迁移 `20261005114500_sasi_experience_trust_router_v90.sql` 提供：
- 用户每日体验预算原子预留/结算；
- 失败释放预算；
- Provider 每日请求、成功、失败、估算 token、延迟 EWMA、cooldown；
- service_role only。

在迁移未应用时，代码可软降级为单实例内存状态；生产启用免费池前应先应用迁移。

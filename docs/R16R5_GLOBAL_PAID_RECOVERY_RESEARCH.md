# R16R5 — Paid Task Recovery Closure / 全球支付恢复优势提取

## 当前失败根因

Production Gate 已经连续通过：
- capability genome
- tool registry / fixture matrix
- continuous tools
- media production
- global commerce
- document format

现在停在：
`PAID_RECOVERY_STRATEGY_MISSING:batch-pdf`

一次性扫描全部 25 个 public paid tool 后发现，不止 batch-pdf：
缺 6 个 recovery strategy：
- batch-pdf
- pdf-ocr
- handwriting-ocr
- pdf-to-word
- pdf-redact
- audio-cleanup

这 6 个共同特点：
- 处理主要发生在浏览器 / 当前页面；
- 文件仍驻留当前 tab 的内存状态；
- 使用 PaidActionButton；
- 当前没有 persistent draft。

因此真实策略是 `retain-tab`，而不是伪装成 persistent-draft 或 server-job。

## 全球成熟支付体系提取

### PayPal
2026 PayPal 官方仍明确建议所有会创建/修改数据的 POST/PUT 带 `PayPal-Request-Id`。
它用于幂等：网络超时、500、用户重复点击时，可以安全重试而不重复扣款。
PayPal 也明确指出：重复交易常来自网络延迟、用户重复点击、客户端没收到响应后重试。

### Stripe
Stripe 同样把 idempotency key 作为安全重试创建/修改请求的标准机制。
连接错误后可以重复同一个请求，而不重复创建/执行动作。

## 对灵犀场的提取

支付恢复不是一个策略解决所有工具，必须区分：

### persistent-draft
适合：
- 上传文件/复杂参数可以安全持久化；
- 支付跳转回来后可完整恢复。
现有视频、图片去水印、字幕等部分工具已使用。

### retain-tab
适合本轮这 6 个工具：
- 浏览器本地文件/状态仍在当前 tab；
- 支付必须优先弹出新窗口；
- 当前 tab 不销毁；
- popup 被阻止且没有 draft 时，不允许强制同页跳转，而是提示用户允许弹窗。

### server-job
适合：
- 任务已经在服务器持久化；
- 页面关闭也能继续；
- 回来按 job/run 恢复。

## 为什么不直接给 6 个工具写“persistent-draft”

它们当前组件没有 draftId，也没有把 File[] / 参数可靠写入 paid-task-draft。
仅修改 JSON 声称 persistent-draft 会产生虚假恢复保证。

因此 R16R5 先做到：
- 25/25 每个收费工具都有真实 recovery strategy；
- 当前 6 个明确为 retain-tab；
- 审计确认组件确实使用 PaidActionButton；
- 审计确认无 persistent-draft 时同页支付跳转被禁止。

后续若我们给这 6 个工具加入真正的 IndexedDB/File draft，再把策略从 retain-tab 升级到 persistent-draft。

## 永久审计改进

旧 audit 只报第一个 missing tool。
R16R5 改为一次输出所有 missing / orphan / invalid strategy。

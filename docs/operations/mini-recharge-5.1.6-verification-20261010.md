# 5.1.6 充值连接修复

## 故障证据

- 2026-10-10 16:57:50–16:58:02，中国标准时间，阿里云 Nginx 访问日志记录真实 iPhone 对充值 availability 的多次 HTTP 403，响应约 34 KB。截图中的“已连接”为微信调试连接，不代表应用接口成功。
- 后续相同 UA、Referer 的请求恢复为 200，因此属于间歇性故障；安卓商家支付限制不能解释这类接口拒绝。
- 历史响应头未留存，不能仅凭日志将每个 403 都认定为 Vercel Security Checkpoint。Vercel 官方说明前置代理会影响真实客户端识别，故采用直接接口通道消除该依赖。

## 配置及代码

- Vercel 现有 celestial9/lingxi-quantum 生产项目新增 mini-api.lingxifield.cn，无重定向。
- 阿里云新增单条 CNAME：mini-api → a9890b80bdafafa4.vercel-dns-017.com，TTL 600 秒；网站 apex、www 及其他记录未修改。
- 公共 DNS 已验证，Vercel 显示 Valid Configuration，HTTPS availability 正常。
- API_BASE 改为独立接口地址，App 共用该配置。
- 区分服务器拒绝、服务繁忙、无效返回与网络失败；仅记录状态码及错误码，不记录用户密钥、身份或财务内容。
- HTML 403 不自动重试；支付 POST 仍不因网络失败自动重发；待确认订单保持原身份。

## 验证

- mini-api-recovery、mini-topup-client、mini-closed-order-recovery、audit-mini-program、verify-miniapp-search-index 均通过。
- 使用实际 iPhone UA 及 servicewechat.com Referer，对新域名连续 5 次 GET，均 HTTP 200，enabled=true；充值金额 10/88/666/888、自定义 0.01–10000 元、两位小数。
- 微信开发者工具 CLI 上传 5.1.6 成功，包大小 1,461,393 字节，凭据 artifacts/mini-upload-5.1.6.json。

## 提交结果

- 管理员扫码确认后，微信开发管理实际列表显示 request、uploadFile、downloadFile 均包含 https://mini-api.lingxifield.cn，并保留 https://lingxifield.cn。本月修改次数由 50 变为 49。凭据 artifacts/wechat-domains-confirmed.png。
- 原 5.1.5 尚未进入审核系统，已撤回以替换完整修复包；5.1.6 于 2026-10-10 19:08:25 提交审核成功，版本管理显示“审核中”。凭据 artifacts/mini-review-5.1.6-result.png、mini-review-5.1.6-pending.png。
- 审核说明填写实际接口修复、充值金额、自定义规则、自动微信身份登录及订单入口 pages/orders/index；保留采集用户隐私的原声明。
- 5.1.6 仍为体验版，线上仍为 5.1.4（16:19:35 发布）。审核通过前不能将体验版当作正式上线。

## 尚待验证

- 真机付款、微信商家限制解除、搜索恢复均未验证。无实际扣款、人工入账或清除未知订单操作。
- 上述 GET 测试不证明微信 requestVirtualPayment 成功，不证明商家限制已经解除。

参考：https://vercel.com/docs/security/reverse-proxy；https://docs.stripe.com/payments/payment-intents/verifying-status。

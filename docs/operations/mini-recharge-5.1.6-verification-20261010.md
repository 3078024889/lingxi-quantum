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

## 尚待完成

- 微信 request、uploadFile、downloadFile 合法域名编辑已填写新域名并保留原域名；保存要求管理员扫码，目前等待确认。不能把表单填写当作配置已生效。
- 域名确认前不提交此包审核或发布；确认后需核对实际保存结果，再提交新版本审核。
- 真机付款、微信商家限制解除、搜索恢复均未验证。无实际扣款、人工入账或清除未知订单操作。
- 上述 GET 测试不证明微信 requestVirtualPayment 成功，不证明商家限制已经解除。

参考：https://vercel.com/docs/security/reverse-proxy；https://docs.stripe.com/payments/payment-intents/verifying-status。

# 灵犀场 LINGXIFIELD · 微信小程序 6.0.0

微信小程序是灵犀场主站的原生入口。首页、100+ 实用工具、全球 SIAI 排行榜及 SASI 智能软件市场与官网保持统一；原生页面只承载微信登录、账户、分享、订单和支付能力。

## 主程序

- AppID：`wxbf4ae90406e7e26b`
- 首屏：`pages/web/index`，打开灵犀场官网首页。
- 账户资料、订单、通知、分享及人民币充值使用原生页面或受限 WebView。
- 页面路由以 `app.json` 为准，不注册旧门户、旧余额页或旧充值页。

## 余额充值

- **人民币 CNY**：唯一小程序原生余额充值入口为 `pages/cny-wallet/index`，采用微信普通商户 JSAPI。服务端通过微信支付 API v3 `/v3/pay/transactions/jsapi` 创建订单，小程序使用 `wx.requestPayment` 唤起收银台。
- **美元 USD**：打开官网 `/ai-wallet?currency=USD`，由官网 PayPal 钱包处理。小程序不创建美元余额充值订单。
- **工具商品**：继续使用独立 `pages/pay/index` 与 `/api/wechat/mini/tool-pay/*` 虚拟支付流程，不与 CNY 余额充值混用。
- CNY 充值可用性、下单和查单分别使用 `/api/wechat/mini/cny-topup/availability`、`/api/wechat/mini/cny-topup/create`、`/api/wechat/mini/cny-topup/status`。
- 客户端支付成功回调不直接入账。必须由服务端验签、核对 AppID/商户号/订单号/金额/付款身份，并通过支付成功回调或微信查单确认后，才幂等结算到账。
- 未确认订单会被保留并恢复核验；不会因客户端超时而删除，也不会在原订单状态不明时重复创建扣款订单。
- 正式开通还要求微信商户已绑定当前小程序 AppID、具备 JSAPI 支付权限，并正确配置服务端商户证书、API v3 密钥及平台公钥。

## 账户与身份

- 使用 `wx.login` 建立小程序身份。
- 用户主动确认后才连接灵犀场账户；不得按邮箱、手机号、昵称或历史订单猜测合并。
- AppSecret、服务端密钥、支付私钥和会话签名材料不得进入小程序发布包。
- 账户余额以服务端账本为准，历史订单、退款记录、支付回调及幂等结算逻辑继续保留。

## 分享与 WebView 安全

- 好友分享由 WebView 页的原生 `onShareAppMessage` 回调承接。
- 朋友圈分享由不含 WebView 的原生分享页承接。
- 分享路径仅允许首页、全球 SIAI 排行榜、SASI 市场（含公开卖家与交付说明）、100+ 实用工具、发现、合作伙伴及关于页面；不传递账户、订单、会话或支付参数。
- WebView 只允许经过白名单校验的灵犀场站内路径，拒绝外部 scheme、协议相对 URL、路径穿越和未知入口。
- 小程序 API 使用国内站正式接口域名 `https://lingxifield.cn`。

## 旧版本清理

以下旧实现不得重新注册或复制进发布包：

- `pages/portal`、`pages/balance`、`pages/recharge`
- `utils/topup-expiry.js`、`utils/virtual-payment-errors.js`
- `/api/wechat/mini/balance-pay/*` 旧余额充值创建、可用性及查单接口
- 指向旧充值页面的 `openMiniRecharge` 导航

历史订单、微信回调验签、服务端查单、退款核验、幂等结算和资金账本不得删除。清理对象是旧入口和旧创建接口，不是历史财务凭证。工具商品虚拟支付独立保留。

## 构建与发布

主小程序：

```bash
node scripts/build-miniapps-v80.cjs main
node scripts/package-miniapp-6-0-0.cjs
```

自动化流程只生成可导入微信开发者工具的 ZIP、SHA-256 和版本信息，不会自动上传微信、提交审核、发布小程序或开启生产支付。完成微信开发者工具编译及真机验收后，再由授权人员上传并提交微信审核。

网站与小程序是两条独立发布流程：.cn 使用阿里云 ENS，.com 使用 Cloudflare；小程序使用微信开发者工具发布。


## 2026-11-17 · 6.0.0 发布验收

- 好友分享使用原生 `onShareAppMessage`；朋友圈分享使用原生 `onShareTimeline`，统一分享主视觉。
- WebView 分享入口仅允许公开路由；账户、钱包、订单、通知、支付及带身份凭证的路径不得进入分享链接。
- CNY 使用独立原生钱包与普通商户 JSAPI；USD 只跳转官网钱包，不在小程序创建美元充值订单。
- 本次构建必须从 `fix/site-wallet-payment-readiness-20261116` 的精确源码提交触发，不能使用 PR 合并测试生成的旧基础分支包。
- CI 只生成 6.0.0 导入 ZIP 与 SHA-256，不代替微信开发者工具真机测试、上传、审核或发布。

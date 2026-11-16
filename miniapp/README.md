# 灵犀场 LINGXIFIELD｜微信小程序 6.0.0

微信小程序是灵犀场主站的原生入口，主界面与官网统一，原生页面只承载必要的微信能力。

## 主小程序

- AppID：`wxbf4ae90406e7e26b`
- 首屏：`pages/web/index`，直接打开灵犀场官网首页。
- 100+ 实用工具、全球 SIAI 排行榜、SASI 智能软件市场均使用统一官网页面，不再维护第二套旧门户菜单。
- 账户、订单、通知、分享和支付入口使用原生页面或受限 WebView。

## 余额充值

- **人民币 CNY**：唯一原生入口为 `pages/cny-wallet/index`，使用微信支付 APIv3 商户 JSAPI 预支付订单，并由小程序调用 `wx.requestPayment`。订单创建使用 `/api/wechat/mini/cny-topup/create`，状态核验使用 `/api/wechat/mini/cny-topup/status`，可用性使用 `/api/wechat/mini/cny-topup/availability`。
- **美元 USD**：打开官网 `/ai-wallet?currency=USD`，使用官网 PayPal 钱包，不在小程序内创建美元充值订单。
- **工具商品**：继续使用独立 `pages/pay/index` 与 `/api/wechat/mini/tool-pay/*`，不与余额充值混用。
- 充值状态由服务端验签回调或 APIv3 查单确认；核对小程序 AppID、商户号、付款 OpenID、订单金额和币种后幂等入账；客户端支付回调不直接入账。重复请求沿用幂等编号，未确认订单不会被本地超时删除。

## 伴随临时邮箱小程序

`pages/mail-home` 只作为独立临时邮箱小程序的构建源，不注册在主小程序 `app.json` 中。它通过 `scripts/build-miniapps-v80.cjs temp-mail` 单独生成，使用独立 AppID 和网站会话，不复制主小程序密钥。

- 人民币充值：跳转主小程序 `pages/cny-wallet/index`。
- 美元充值：打开官网 `/ai-wallet?currency=USD`。
- 页面不再包含旧 SASI 图片创作入口或旧充值页跳转。

## 旧版本清理

以下旧实现已从当前发布源码移除，不允许重新注册或复制进发布包：

- `miniapp/pages/portal`、`miniapp/pages/balance`、`miniapp/pages/recharge`
- `miniapp/utils/topup-expiry.js`、`miniapp/utils/virtual-payment-errors.js`
- `app/api/wechat/mini/balance-pay/*` 旧可用性、创建和查单接口
- `openMiniRecharge` 与指向旧充值页的导航

历史订单、微信支付回调验签、服务端查单、退款核验、幂等结算和资金账本继续保留。删除的是旧用户入口与旧创建接口，不是历史财务凭证。

## 构建与验收

主小程序：

```bash
node scripts/build-miniapps-v80.cjs main
node scripts/package-miniapp-6-0-0.cjs
```

伴随临时邮箱小程序仅作独立构建验证：

```bash
node scripts/build-miniapps-v80.cjs temp-mail
node scripts/test-mini-profiles-v80.cjs --check-builds
```

构建产物由 GitHub Actions 保存为可导入微信开发者工具的 ZIP 与 SHA-256。自动化流程不会上传微信、提交审核、开启生产支付或部署网站。微信开发者工具真机验收通过后，才由人工上传并提交微信审核。

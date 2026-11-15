# 灵犀场小程序 5.7.1 发布与微信虚拟支付配置

## 5.7.1 本轮修复

- 首页、账户页、钱包页统一进入原生充值承载页 /pages/balance/index。
- 新版钱包传入的金额由原生页读取；固定档位和自定义金额不再丢失。
- 原生充值确认页重构为新版浅色晶体视觉，不再显示旧版重复选择界面。
- 小程序自定义充值限制为人民币 1–10,000 元整数元，与现有已发布 lx_balance_custom 商品（100 分/单位）一致。
- 服务端同步拒绝小数金额，不再尝试调用未核实发布的 lx_balance_cent 商品。
- 保留待确认订单、账户绑定、订单查询、回调幂等和防重复扣款保护。
- 充值开关继续 fail-closed；本次构建不会自动打开生产收款。
- 原生充值页增加美元充值官网指引；复制 `https://lingxifield.com/ai-wallet?currency=USD`，在微信外的手机浏览器打开，官网钱包自动选择 USD；小程序内不发起 PayPal 付款。

## 微信后台设置

### 1. 核实虚拟支付已开通

进入微信公众平台小程序后台：

支付与交易 → 虚拟支付 → 基本配置

核对并记录：
- OfferID
- 现网 AppKey
- 沙箱 AppKey（仅沙箱测试使用）
- 小程序简称；iOS 端还要按后台要求开通苹果 IAP

若小程序主体为个人主体，另外核对服务类目包含「工具」并确认虚拟支付月限额。
不要把 AppKey 发到聊天、截图或 GitHub。现网 AppKey 只能放在服务端密钥环境中。

### 2. 核实已发布的充值道具

进入 支付与交易 → 虚拟支付 → 道具管理，核对线上版本已有五项：

| 道具 ID | 单价 |
|---|---:|
| lx_balance_10 | 1000 分 |
| lx_balance_88 | 8800 分 |
| lx_balance_666 | 66600 分 |
| lx_balance_888 | 88800 分 |
| lx_balance_custom | 100 分/单位 |

这些商品已有历史发布记录。不要重复创建、改价或重新发布。若后台当前状态与此表不同，先暂停，不要开启收款。

逐个打开商品详情，确认商品处于「已发布」，并开启「道具发货推送」。该开关未启用时，支付成功后不会按预期触发自动发货通知。商品状态与开关以微信后台实时显示为准。

### 3. 配置发货与退款通知

项目接收地址：

https://lingxifield.cn/api/wechat/mini/pay/notify

在小程序后台 开发 → 开发管理 → 消息推送 配置 URL 与 Token，并订阅虚拟支付发货通知、退款通知。

当前接收端实现的是明文 JSON + URL Token SHA-1 验签。消息推送数据格式选 JSON，消息加解密方式选明文模式。不要选择安全模式/AES 模式；当前代码没有启用该模式的解密处理。

同一个 Token 必须同时写入 .cn 服务端环境变量 WECHAT_MINI_MESSAGE_TOKEN。保存后用后台 URL 校验完成 GET echostr 验证。

### 4. .cn 服务端环境变量

只在当前承载 .cn 小程序 API 的生产服务端配置；不要写进小程序源码、ZIP、GitHub、浏览器前端，也不要配置到 .com Worker。

.cn 发布端口约定：3194 为当前生产，3193 为回滚基线；3195 与 3196 已有历史候选服务记录，不能直接覆盖。必须先在 ENS 只读核验端口占用，再选择一个确实空闲的隔离候选端口。本轮构建工作流不会直接部署 ECS/ENS，也不会切换生产 Nginx。

| 变量 | 值/说明 |
|---|---|
| WECHAT_MINI_VPAY_ENV | production |
| WECHAT_MINI_VPAY_OFFER_ID | 微信虚拟支付「基本配置」中的 OfferID |
| WECHAT_MINI_VPAY_APP_KEY | 微信虚拟支付现网 AppKey，服务端密钥 |
| WECHAT_MINI_VPAY_TOPUPS_ENABLED | 验收完成后设为 true |
| WECHAT_MINI_MESSAGE_TOKEN | 与微信「消息推送」页面完全一致 |
| WECHAT_MINI_SESSION_ENCRYPTION_KEY | 32 字节随机密钥的 Base64 字符串 |
| WECHAT_MINI_APP_ID | 保持 wxbf4ae90406e7e26b |
| WECHAT_MINI_APP_SECRET | 保留现有小程序 AppSecret，不要替换成虚拟支付 AppKey |

如果尚无 WECHAT_MINI_SESSION_ENCRYPTION_KEY，在可信服务器终端生成：openssl rand -base64 32。生成结果只写入服务端密钥环境，不要发送到聊天。

如果需要新建消息推送 Token，在可信终端生成：openssl rand -hex 24。把同一结果分别写入微信消息推送 Token 和 .cn 服务端 WECHAT_MINI_MESSAGE_TOKEN。

WECHAT_MINI_VPAY_SANDBOX_APP_KEY 只用于开发工具沙箱。生产支付必须使用现网 AppKey，env=0。不要把沙箱密钥用于生产。

保持 WECHAT_MINI_VPAY_TOOLS_ENABLED 关闭；本轮只开放余额充值，不扩大到工具商品支付。

### 5. 开关启用顺序

不要仅因 OfferID/AppKey 已填就开启。先完成：
1. 服务端变量核验，确认 AppID 与小程序主体一致。
2. 微信消息推送 URL 校验通过。
3. 五项商品 ID、价格和线上发布状态核对通过。
4. 真机完成小额人民币支付。
5. 微信发货通知或服务端查单确认支付，余额只入账一次。
6. 订单页、资金管理账单、余额账本金额一致。
7. 完成 Android 退款及撤权核验；iOS 退款按 App Store 流程说明。

以上验收完成后，才设置 WECHAT_MINI_VPAY_TOPUPS_ENABLED=true 并重启 .cn 服务。未通过时保持 false，页面只允许查看账户与订单，不创建支付订单。

## USD 美元余额充值（网站 PayPal）

USD 与小程序人民币虚拟支付是两条独立链路：

- 网站使用 `/checkout-usd`，由 PayPal Live 以 USD 收款，到账到独立 USD 余额，不换算成人民币。
- 商品 ID：`sasi-usd-balance-10`、`sasi-usd-balance-88`、`sasi-usd-balance-666`、`sasi-usd-balance-888`；自定义金额使用 `sasi-usd-balance-custom-金额`。
- 小程序原生 `wx.requestVirtualPayment` 本轮只支持 CNY。小程序内不显示 USD 充值选项；不要把 PayPal USD 订单塞进微信虚拟支付链路。USD 充值从网站账户钱包进入。

### PayPal Live 配置

在每个实际承载网站支付 API 的生产环境分别核对以下变量：

| 变量 | 生产值/用途 |
|---|---|
| `PAYPAL_ENV` | `live` |
| `PAYPAL_ENABLED` | `true` |
| `PAYPAL_CLIENT_ID` | PayPal Live 应用 Client ID |
| `PAYPAL_CLIENT_SECRET` | 同一 Live 应用 Secret |
| `PAYPAL_WEBHOOK_ID` | 当前部署域名在该 PayPal Live 应用中登记的 Webhook ID |
| `USD_BALANCE_TOPUP_ENABLED` | USD 充值验收完成后才设为 `true` |
| `SASI_REFUND_FLOW_TESTED` | USD 退款/撤销链路验收通过后才设为 `true` |

PayPal Live 应用分别登记实际接收站点的 Webhook：

- CN：`https://lingxifield.cn/api/pay/paypal/webhook`
- COM：`https://lingxifield.com/api/pay/paypal/webhook`

订阅代码处理的事件：`CHECKOUT.ORDER.APPROVED`、`CHECKOUT.ORDER.COMPLETED`、`PAYMENT.CAPTURE.COMPLETED`、`PAYMENT.CAPTURE.PENDING`、`PAYMENT.CAPTURE.DENIED`、`CHECKOUT.PAYMENT-APPROVAL.REVERSED`、`PAYMENT.CAPTURE.REFUNDED`。若两个域名分别注册 Webhook，每个站点的 `PAYPAL_WEBHOOK_ID` 必须对应本域名的 Webhook；不要把另一个 URL 的 ID 直接复制过来。

**启用顺序：** 先在 PayPal Sandbox 验证创建订单、完成付款、回调验签、USD 余额只入账一次、退款后余额与账本回滚；再核对 Live 凭证、Webhook ID 和回调事件，完成一笔受控小额真实交易及退款演练。全部通过后才分别开启 `USD_BALANCE_TOPUP_ENABLED=true` 与 `SASI_REFUND_FLOW_TESTED=true`。

网站钱包的 `/api/pay/providers` 现在会单独返回 `usdBalanceTopup`。只有 PayPal Live 本身已启用、且上述两个 USD 专用开关都通过时，USD 充值按钮才会启用；仅有 PayPal 已连接，不代表 USD 余额充值已开放。

不要把 Client Secret、Webhook ID 或任何密钥发到聊天或写入小程序 ZIP、GitHub 源码。

## iOS 兼容条件

微信虚拟支付的 iOS 端还需在微信后台配置小程序简称并开通苹果 IAP。用户设备需 iOS 15 及以上、微信 8.0.68 及以上，并使用中国大陆 App Store 账户；单笔至少 1 元。其他地区 App Store 账户可能无法完成 iOS 支付。可先用 Android 真机完成支付链路验收。

## 5.7.1 上传

1. 下载 GitHub Actions 产出的 lingxifield-miniapp-5.7.1.zip。
2. 解压到独立目录，例如 D:\30780\lingxifield-miniapp-5.7.1。
3. 微信开发者工具选择「导入项目」，目录选择解压后的项目根目录（根目录应直接看到 project.config.json 和 app.json）。
4. AppID 自动识别为 wxbf4ae90406e7e26b。
5. 先点击「预览」，真机核对首页、账户、余额页、金额带入、订单查看、分享，以及美元官网充值地址复制和官网 USD 选中状态。
6. 确认版本号填写 5.7.1，版本描述填写「统一余额充值入口；修复充值金额传递；重构原生虚拟支付确认页；完善人民币自定义金额校验；新增美元官网充值指引」。
7. 先上传为体验版，不直接提交正式审核。实付与退款验收通过后再提交审核。

ZIP 不包含 project.private.config.json、临时邮箱子项目页面或任何服务端密钥。
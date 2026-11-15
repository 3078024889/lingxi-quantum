# 灵犀场小程序 5.7.0 发布与微信虚拟支付配置

## 5.7.0 本轮修复

- 首页、账户页、钱包页统一进入原生充值承载页 /pages/balance/index。
- 新版钱包传入的金额由原生页读取；固定档位和自定义金额不再丢失。
- 原生充值确认页重构为新版浅色晶体视觉，不再显示旧版重复选择界面。
- 小程序自定义充值限制为人民币 1–10,000 元整数元，与现有已发布 lx_balance_custom 商品（100 分/单位）一致。
- 服务端同步拒绝小数金额，不再尝试调用未核实发布的 lx_balance_cent 商品。
- 保留待确认订单、账户绑定、订单查询、回调幂等和防重复扣款保护。
- 充值开关继续 fail-closed；本次构建不会自动打开生产收款。

## 微信后台设置

### 1. 核实虚拟支付已开通

进入微信公众平台小程序后台：

支付与交易 → 虚拟支付 → 基本配置

核对并记录：
- OfferID
- 现网 AppKey
- 沙箱 AppKey（仅沙箱测试使用）

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

## iOS 兼容条件

微信虚拟支付的 iOS 端还需在微信后台配置小程序简称并开通苹果 IAP。用户设备需 iOS 15 及以上、微信 8.0.68 及以上，并使用中国大陆 App Store 账户；单笔至少 1 元。其他地区 App Store 账户可能无法完成 iOS 支付。可先用 Android 真机完成支付链路验收。

## 5.7.0 上传

1. 下载 GitHub Actions 产出的 lingxifield-miniapp-5.7.0.zip。
2. 解压到独立目录，例如 D:\30780\lingxifield-miniapp-5.7.0。
3. 微信开发者工具选择「导入项目」，目录选择解压后的项目根目录（根目录应直接看到 project.config.json 和 app.json）。
4. AppID 自动识别为 wxbf4ae90406e7e26b。
5. 先点击「预览」，真机核对首页、账户、余额页、金额带入、订单查看和分享。
6. 确认版本号填写 5.7.0，版本描述填写「统一余额充值入口；修复充值金额传递；重构原生虚拟支付确认页；完善小程序人民币自定义金额校验」。
7. 先上传为体验版，不直接提交正式审核。实付与退款验收通过后再提交审核。

ZIP 不包含 project.private.config.json、临时邮箱子项目页面或任何服务端密钥。

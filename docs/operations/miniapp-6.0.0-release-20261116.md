# 灵犀场微信小程序 6.0.0｜双币种充值与旧入口清理

状态：独立候选分支，等待 GitHub Actions 源码验收与可导入 ZIP 构建。尚未上传微信开发者工具、提交微信审核或开启生产充值。

## 唯一支付路径

- CNY 余额：主小程序 `pages/cny-wallet/index`，微信原生虚拟商品支付。
- USD 余额：官网 `/ai-wallet?currency=USD`，由 PayPal 处理。
- 工具商品：独立 `pages/pay/index` 和 `/api/wechat/mini/tool-pay/*`。
- 伴随临时邮箱小程序不复制主小程序凭据；人民币跳转主小程序 CNY 钱包，美元打开官网 USD 钱包。

## 删除范围

- 旧 `pages/portal`、`pages/balance`、`pages/recharge`。
- 旧 `utils/topup-expiry.js`、`utils/virtual-payment-errors.js`。
- 旧 `/api/wechat/mini/balance-pay/{availability,create,status}`。
- 旧 `openMiniRecharge` 及所有指向旧充值页的有效入口。
- 旧 5.7.x 打包工作流与打包脚本不作为 6.0.0 发布路径。

`pages/mail-home` 仅保留为独立临时邮箱小程序的构建源，不在主小程序 `app.json` 注册；旧 AI 图片创作入口与旧充值跳转已从该页面移除。

## 资金安全保留

保留历史微信虚拟支付订单回调验签、服务端查单、退款核验、幂等结算、账户余额与资金账本。旧客户端创建接口删除后，不会影响已生成订单的回调和退款核验。

## 自动验收

- 小程序页面路由、WebView 白名单、分享与账户同步。
- CNY 原生支付签名、金额 SKU、重复请求保护、订单核验与退款路径。
- USD PayPal 钱包可用性闸门。
- 手机端账户名输入框与保存按钮布局。
- 主小程序和伴随临时邮箱小程序隔离构建、依赖检查、ZIP 完整性与 SHA-256。

自动化仅生成导入 ZIP，不上传微信、不提交审核、不启用生产支付、不部署 CN/COM 网站。

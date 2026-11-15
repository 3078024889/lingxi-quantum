# 灵犀场小程序 5.7.3：官网钱包统一充值

日期：2026-11-15

## 变更结论

人民币 CNY 与美元 USD 的钱包充值统一由灵犀场官网钱包处理。小程序不再创建钱包充值订单，也不再调用微信虚拟支付购买余额商品。

- 官网钱包入口：`/ai-wallet`
- 小程序内入口：`/pages/web/index?path=%2Fai-wallet`
- 官网收银台继续根据币种选择对应的支付渠道。
- 小程序的旧 `/pages/balance/index` 路径保留为兼容入口，只负责跳转官网钱包。
- 原生工具商品购买继续使用独立微信虚拟支付，不与余额充值混用。

## 已移除

- `miniapp/pages/recharge/` 原生充值页。
- 原生余额页中的金额选择、充值下单、微信虚拟充值、充值状态轮询与过期清理。
- `miniapp/utils/topup-expiry.js`。
- `miniapp/utils/virtual-payment-errors.js`。
- `/api/wechat/mini/balance-pay/availability`。
- `/api/wechat/mini/balance-pay/create`。
- `/api/wechat/mini/balance-pay/status`。
- 登录流程对旧充值 availability 接口的依赖。
- 独立临时邮箱小程序构建器中生成旧充值页的逻辑。

## 继续保留

- 小程序登录、账户绑定、余额读取、订单查看。
- 官网钱包中的 CNY/USD 余额、资金账本、充值、退款与提现记录。
- 官网原有支付、订单、退款和资金流水服务。
- 已审核工具商品的独立微信虚拟支付。
- 服务端对旧版本已经创建的虚拟充值订单进行回调验签、微信查单与幂等结算。该逻辑仅用于历史订单，不可作为新充值入口。

## 版本与安全边界

- 新包版本：5.7.3。
- 主小程序 AppID：`wxbf4ae90406e7e26b`。
- 小程序钱包充值创建接口已从源码删除；旧客户端调用将无法创建新的余额充值订单。
- `WECHAT_MINI_VPAY_TOPUPS_ENABLED` 不再控制新充值入口，不应重新启用旧原生充值。
- 工具支付仍由 `WECHAT_MINI_VPAY_TOOLS_ENABLED` 单独控制。
- 本轮源码变更不修改用户余额、历史订单、账本、退款记录或生产环境密钥。
- 本轮 GitHub Actions 仅生成微信开发者工具导入包，不自动上传微信、不提交审核、不切换 CN 生产服务。

## 验收项目

1. 主小程序旧余额路径跳转官网 `/ai-wallet`。
2. 独立临时邮箱小程序不再生成 `pages/recharge`。
3. 官网钱包在小程序 WebView 中显示 CNY/USD 官网收银台入口。
4. 小程序登录不再请求旧 `balance-pay/availability`。
5. 旧余额充值 API 路由不存在。
6. 工具虚拟支付创建、查单与发货流程保持独立。
7. 历史虚拟充值回调结算逻辑保留。
8. ZIP 不含旧充值页、旧充值工具模块或服务端密钥。

## 上传说明

GitHub Actions 生成 5.7.3 ZIP 后，先导入微信开发者工具预览，核对首页、分享、账户、官网钱包、订单、工具支付及 CNY/USD 充值跳转。该 ZIP 需要人工上传为体验版并完成真机验收；不会由 CI 自动发布。

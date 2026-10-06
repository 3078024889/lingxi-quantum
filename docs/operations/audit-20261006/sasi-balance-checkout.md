# SASI 输入与全站工具余额支付

核对上一提交 2c9f213 的 GitHub Actions：构建、源码门禁通过；桌面 294 项通过、1 项失败，失败是 Linux Chromium 对 H.264/AAC 成片无法读取时长。改为安装并运行 Chrome，保留原有真实视频合成与播放断言，不取消媒体测试。参考 https://playwright.dev/docs/browsers 。

七种任务使用同一个 980px 内容宽度（含边距的外层上限 1036px），手机根据屏幕收缩。删除视频页单独放大外层的样式。参考 https://www.assistant-ui.com/elements/composer 的统一布局方式。

所有使用工具报价结账的付费工具增加余额支付。登录身份由服务端验证，金额和币种读取已保存的报价，客户端不传扣款金额。人民币和美元使用各自的 SASI 钱包。报价行锁和唯一流水保证重复请求只扣一次；报价锁同时与外部支付初始化互斥。扣款、订单、工具资格同一事务，失败不留下部分扣款。额度追加使用原有 fulfill_tool_order 流程。未配置可用执行方式的工具继续拒绝收款。

修复现有人民币流水类型约束拒绝 usage_v49 的问题，保留所有已允许类型。新增 RPC 只有 service_role 可调用；不允许网页直接扣款。参考 https://docs.stripe.com/api/idempotent_requests 。本轮没有使用用户余额进行真实扣费；数据库测试使用临时测试账户，在同一事务回滚。

数据库验证：CNY/USD、重复请求、所有权、余额不足、报价过期、外部结账互斥、资格发放通过。测试文件 scripts/test-tool-balance-transaction.sql，不能移除最后 rollback。

# 服务连接与已有余额修复

连接页：电脑左右两栏，手机上下布局。左侧按多模型平台、模型官方服务、其他智能服务分类；右侧只显示当前服务的信息和设置。去掉重复页面容器、CNY/USD 通道和使用所有全球模型的泛化说明。保留九语言与阿拉伯语方向，服务切换清除未提交密钥，密码输入不回显。已知服务默认只需密钥，指定模型与地区地址为可选项；其他兼容文本服务仍必须填写地址和模型。

页面描述以真实站内执行为准：文本连接支持各自模型的对话和资料能力；当前站内图片走火山方舟，视频走火山、OpenAI、xAI、百炼。OpenRouter 官方已有独立视频接口，但当前站内尚未接入；Luma 目前仅保存和检查，明确指向官网使用，未伪装成可生成。

已有余额错误：money_balance_snapshot_v52 显示 ai_wallets + sasi_wallets；旧 charge_sasi_usage_v49 仅扣 sasi_wallets。截图对应账户确有旧余额 500 分、新余额 0 分，2 元订单因此错误返回余额不足。修复后的消费在同一个事务内锁定两种来源，以当前账本优先，再消费旧余额，分别记录来源流水、减少可退本金，保留冻结与任务预留；人民币美元独立。预检也使用余额页相同快照。无迁移充值、无增加余额、无消费真实用户资金。数据库迁移已应用。

真实 SQL 测试：scripts/test-unified-existing-balance.sql。在事务内建立测试账户，覆盖旧余额单独支付、两来源合用、真实工具权限发放、重复扣费、不同金额重复引用、余额不足、冻结保护、可退本金与流水；全部回滚。原工具余额事务测试继续保留。

参考：
- Open WebUI 连接设置源码：https://github.com/open-webui/open-webui/blob/main/src/lib/components/admin/Settings/Connections.svelte。提取服务与配置分开管理、默认设置与覆盖值区分的设计；独立实现，未复制源码。
- 火山 API 密钥权限：https://docs.volcengine.com/docs/ark/api-key?lang=zh。
- OpenRouter 视频接口：https://openrouter.ai/docs/guides/overview/multimodal/video-generation。
- OpenRouter 美元计费：https://openrouter.ai/support。
- PostgreSQL 行锁：https://www.postgresql.org/docs/current/explicit-locking.html。
- Stripe 余额交易流水：https://docs.stripe.com/api/customer_balance_transactions。只借鉴原子账本和可追踪流水原则，未替换为 Stripe，也未使用 Stripe 发票余额规则处理平台余额。

上一轮最终提交 bc50ecf 的本地完整回归 598 项通过，GitHub Actions 37440494423 构建、桌面和手机全部成功。新提交的构建和浏览器检查单独记录，不能把旧提交结果冒充新提交结果。

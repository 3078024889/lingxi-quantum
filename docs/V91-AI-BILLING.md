# V9.1 AI 计费规则

前台：
- 钱包显示人民币余额。
- 周期额度显示百分比，每 6 天自动重置。
- 重置只恢复本周期可用百分比，不恢复已经消费的钱。
- 邀请 1 位新用户，且其首次符合条件的 AI 余额充值达到 ¥50，邀请人获得 1 次手动重置机会。
- 未消费本金单独记录为“可原路退款本金”。

后台：
- 所有金额用“分”整数保存。
- 请求前先按最大输出预算预留金额。
- 模型成功后读取供应商真实 usage。
- 按真实成本 × 零售倍率结算。
- 多预留金额立即释放。
- 模型失败则整笔释放。

初始 6 天额度上限：
- 未充值：¥1
- 累计充值不足 ¥50：¥10
- 累计充值 ≥ ¥50：¥30
- 累计充值 ≥ ¥100：¥60
- 累计充值 ≥ ¥300：¥180
- 累计充值 ≥ ¥500：¥300

Provider Router：
- 当前火山方舟配置好 `VOLCENGINE_ARK_API_KEY` 即可生产使用。
- DeepSeek / 智谱 / OpenAI 只有在“Key + Model ID + 当前官方人民币单价”都配置时才会启用。
- 这样不会把某家过期的“免费价/促销价”硬编码进生产计费。

当前建议环境变量：

```text
VOLCENGINE_ARK_API_KEY=<secret>
VOLCENGINE_ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
AI_DEFAULT_PROVIDER=volcengine
AI_DEFAULT_MODEL=doubao-seed-evolving
AI_RETAIL_MULTIPLIER=4
AI_MINIMUM_CHARGE_FEN=10
```

以后接智谱/DeepSeek：

```text
AI_PROVIDER_ORDER=zhipu,deepseek,volcengine
ZHIPU_API_KEY=<secret>
ZHIPU_MODEL=<当前真实模型ID>
ZHIPU_INPUT_RMB_PER_M=<当前官方输入单价>
ZHIPU_OUTPUT_RMB_PER_M=<当前官方输出单价>
```

DeepSeek 同理用 `DEEPSEEK_*`。

不要把任何第三方临时赠送额度宣传成“灵犀场永久免费 AI”。

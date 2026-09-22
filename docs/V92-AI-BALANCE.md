# V9.2 — 纯充值余额制

## 产品规则

这不是会员制。

- 充值人民币余额。
- 按实际 AI 使用量扣费。
- 未使用充值本金不按周/月清零。
- 页面显示“当前余额 + 余额状态百分比”，百分比只是本次充值/奖励后的余额消耗进度，不是周期额度。
- 失败的模型请求释放全部预留金额。
- 赠送额度优先于充值本金消耗。
- 赠送额度不能提现、不可退款、不可转账。
- 未消费的充值本金单独记录为可申请原路退款本金。

## 三档智能模式

- 轻量：1× 消耗
- 标准：2× 消耗，默认
- 高智能：5× 消耗

“×”是灵犀场零售计费系数的一部分；最终仍根据真实 provider usage 结算。
模式同时允许未来映射不同 Provider / Model：

```text
AI_LIGHT_PROVIDER=
AI_LIGHT_MODEL=
AI_STANDARD_PROVIDER=
AI_STANDARD_MODEL=
AI_HIGH_PROVIDER=
AI_HIGH_MODEL=
```

没有配置时，三档都会回落到当前默认 Provider / Model，但输出预算与计费系数不同。

## 邀请奖励

- 新用户在首次充值前绑定邀请关系。
- 该用户之后每笔真实 AI 余额充值 >= ¥50：
  - 邀请人获得该笔充值 10% 的 AI 赠送额度。
- 每个支付订单只发一次奖励（order_id 唯一），避免重复回调重复送额度。
- 数据库保留 reward 记录，为未来退款/拒付时撤回奖励做准备。

## 当前 Provider

火山方舟已实测可用：

```text
VOLCENGINE_ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
AI_DEFAULT_PROVIDER=volcengine
AI_DEFAULT_MODEL=doubao-seed-evolving
AI_RETAIL_MULTIPLIER=4
AI_MINIMUM_CHARGE_FEN=10
```

API Key 必须继续保存在 Vercel Secret 中。

## 不承诺使用天数

充值页面不写“¥100 一定能用多少天”。
实际消耗由：
- 输入资料长度
- 历史上下文长度
- 输出长度
- 图片/视频等多模态输入
- 智能模式
- Provider / Model
共同决定。

上线后可基于真实匿名聚合 usage 做“历史参考区间”，但仍不作为承诺。

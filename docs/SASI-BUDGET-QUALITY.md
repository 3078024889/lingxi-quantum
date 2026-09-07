# SASI 预算与质量保护 / Budget and Quality Protection

## 核心规则 / Core Rule

预算不仅决定能否生成，也必须解释能达到什么质量。系统不得隐藏降级，不得先调用收费 API 再告知价格。

Budget determines both feasibility and achievable quality. The system must never silently downgrade or invoke a paid API before showing the price.

## 生成前确认 / Pre-generation Confirmation

确认卡必须展示：目标、成片时长、建议集数、质量档位、镜头策略、预计成本、冻结金额、预算差额、潜在质量风险和失败结算规则。用户确认后冻结余额；执行完成按实际成本结算并释放差额。

The confirmation card shows outcome, duration, recommended episode structure, quality tier, shot strategy, estimated cost, reserved amount, budget gap, quality risks and failure settlement. Funds are reserved only after confirmation and the unused difference is released after settlement.

## 质量等级 / Quality Tiers

- 快速：适合测试想法、运动图与低复杂度镜头。
- 高清：适合正式短剧，兼顾人物一致性、动作与成本。
- 电影级：将高成本资源集中于开场三秒、主角登场、高潮、关键情绪和结尾钩子。

- Fast: concept validation, motion stills and low-complexity shots.
- High Definition: production shorts balancing continuity, motion and cost.
- Cinema: concentrates premium generation on the opening, character reveals, climax, key emotion and final hook.

## 预算不足 / Insufficient Budget

系统应显示可执行选择：增加预算、缩短时长、降低部分镜头复杂度、改用静态图加运动、使用更经济档位，或连接用户自己的 API Key。预算与所选质量不匹配时禁止确认付费生成；用户主动选择替代方案后重新报价。

Offer concrete choices: increase budget, shorten duration, simplify selected shots, use motion stills, choose a lower-cost tier, or connect a personal API key. Block paid confirmation when budget and selected quality do not match, then re-quote after the user changes the plan.

## 当前基线 / Current Baseline

`100 points = ¥1`。当前规划销售基线为：Veo Lite ¥0.69/秒、Sora 2 ¥1.19/秒、Sora 2 Pro ¥3.49/秒、Veo Standard ¥4.59/秒。价格是工程基线，不是永久承诺；上线时必须从后台价格表读取，并在每次任务确认前锁定。

`100 points = ¥1`. Planning baselines are Veo Lite ¥0.69/s, Sora 2 ¥1.19/s, Sora 2 Pro ¥3.49/s and Veo Standard ¥4.59/s. These are engineering baselines, not permanent promises; production pricing must be server-managed and locked per confirmed job.

## 零预算经营 / Zero-upfront-cost Operation

只有预付或 BYOK 可以避免平台垫资。支付回调确认到账后才可增加余额，余额冻结成功后才创建 Provider 任务。必须保留支付手续费、汇率、失败重试、存储和退款准备金；禁止赠送需要平台承担外部算力成本的额度。

Only prepaid credits or BYOK avoid platform-funded compute. Credit the wallet after verified payment callbacks and create provider jobs only after a successful reservation. Maintain reserves for fees, FX, retries, storage and refunds; never grant credits that require unfunded external compute.

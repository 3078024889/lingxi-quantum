# 灵犀场 SASI V5.1 Completion

基线：`fd4457686c6a0bc599a44eb6feab16e708648a4d`

## 本轮补齐 V5 文档中此前明确未完成的 7 项

1. 图像语义质量 Judge
2. 视频 temporal consistency / identity Judge
3. Character DNA / Style DNA UI 与版本化资产
4. 全球 Agent Radar 定时发现
5. Shadow / Canary 控制基础
6. Operator 质量与利润仪表盘
7. 普通用户 Outcome Quote + SASI 余额托管视频链路

## 真实实现

### 视觉质量
- `sharp` 图像技术质量检查
- `ffprobe` 视频技术质量检查
- 视频抽帧后送入 OpenAI-compatible 视觉 Judge
- Premium/臻选在没有语义 Judge 时 fail-closed，不冒充高质量
- 托管视频交付前进入 V5 Validation，未达标不交付

### 项目连续性
- 人物 DNA / 风格 DNA 多版本
- 批准/替代状态
- Approved Asset Library 多版本
- 用户只能读取自己的项目资产

### 全球新智能体
- 每日 Cron 扫描十个主流开源 Agent / Workflow / Gateway 项目
- 新版本只进入 `quarantine`
- 不会因为“最新”自动成为 Stable

### Shadow / Canary
- 确定性哈希流量分配
- 私有内容默认不能 Shadow
- 只有 public benchmark 或明确 opt-in 用户内容可以进入 Shadow

### Operator
- 新的 `/sasi/operator/v5`
- 展示 V5 路由、学习信号、Agent/Model Registry、DNA、Validation、Experiment 的真实记录
- 无数据不推断

### Outcome Quote
- `/api/sasi/quote` 恢复为平台托管视频报价
- 只在支付闭环、内容标识、退款/结算、已验证视频 Provider 全部 Ready 时开放
- `/api/sasi/jobs` 先 Reserve SASI 余额，再提交 Provider
- 成功按已有 verified usage 结算；失败释放余额
- `/sasi/drama` 默认显示托管模式；BYOK 保留在“专业连接”

## 需要真实生产环境配置才能变成 READY 的项目

代码已完成，但以下不能伪造：
- `SASI_VISUAL_JUDGE_BASE_URL`
- `SASI_VISUAL_JUDGE_API_KEY`
- `SASI_VISUAL_JUDGE_MODEL`
- 当前有效的 `SASI_VIDEO_RATES_JSON`
- 已真实低成本验收后写入 `SASI_VERIFIED_VIDEO_PROVIDERS`
- 现有 paid production gate 所需退款/结算/标识环境变量
- `CRON_SECRET` 或 `SASI_RADAR_CRON_SECRET`

如果这些未配置：
- 臻选视觉结果 fail-closed
- 托管视频显示暂时不可用
- Agent Radar 不执行
- 不会偷偷降级到低质量路线

## 数据库

本轮依赖两个 additive migration：
- `20260928170000_sasi_v5_quality_learning_foundation.sql`（已在仓库，但当前生产数据库尚未应用）
- `20260928193000_sasi_v51_completion.sql`

生产发布脚本不会自动改数据库。这是刻意的安全边界。

## 自我迭代边界

V5.1 允许：
- 记录脱敏运行信号
- 形成 Failure Atlas
- 产生 Candidate
- Benchmark
- Shadow
- Canary
- Promotion / Rollback 证据

V5.1 不允许：
- Agent 自己改支付/RLS/密钥后直接上线
- 新 Agent 自动 Stable
- 私密用户内容默认用于全局训练
- 质量不达标时为了利润强行交付

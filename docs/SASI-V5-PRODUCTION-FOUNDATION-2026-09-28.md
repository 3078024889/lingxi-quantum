# 灵犀场 SASI V5 Production Foundation

本包基于当前 main `80794ea144d2aa092eef9bcf76834ba7361d2888`，把已有 SASI Kernel、学习与 promotion 基础继续收敛到 V5。

## 本包真实包含

- Quality-first Gate：质量门槛先于成本优化
- Quality Adjusted Cost / Cost per accepted result
- Outcome Quote 与 Margin Guard
- Stable-first Router
- Capability Registry bridge
- Native model candidate bridge
- Agent Radar 状态机
- Privacy-preserving outcome signals
- Route decision telemetry
- V5 readiness API
- V5 feedback API
- Additive Supabase migration
- V5 audit script

## 安全边界

- `SASI_V5_LEARNING_ENABLED` 默认关闭。
- V5 telemetry 不保存 prompt、图片、视频、PDF 或对话原文。
- Candidate 不会因为“最新”自动晋级 Stable。
- 本包不会自动应用数据库 migration。
- 支付、RLS、密钥、生产部署不允许 SASI 自主改写后直接上线。

## 尚未伪装为完成

以下需要后续真实视觉样本和生产验收：

- 图像语义质量 Judge
- 视频 temporal consistency / identity Judge
- Character DNA / Style DNA UI 与资产版本化
- 全球 Agent Radar 定时抓取器
- 自动 Shadow / Canary 流量
- Operator 质量与利润仪表盘
- 普通用户统一 Outcome Quote 替代当前 BYOK 收费体验

这些本包没有标记 PASS。

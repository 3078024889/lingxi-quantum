# 灵犀场 LINGXIFIELD｜SASI 生成能力与收费配置总表

更新日期：2026-09-28

## 核心原则

1. 灵犀场不替用户垫付第三方 AI 服务费用。
2. 普通创作页只讲任务、结果和费用；API Key 只在“连接 AI 服务”页面明确出现。
3. “SASI 创作余额”统一简称为“SASI 余额”。
4. 用户自己的 API Key 产生的第三方费用，不从 SASI 余额代扣。
5. V1 用户自带 API Key 的生成任务暂不另收平台服务费。

## 当前代码中的真实生成链路

| 能力 | 当前执行链路 | 配置 | 费用承担 |
|---|---|---|---|
| 文本 | 火山方舟 Ark | SASI_BYOK_TEXT_PROFILE | 用户自己的 AI 服务账户 |
| 图片 | 火山方舟 Ark / Seedream 类 | SASI_BYOK_IMAGE_PROFILE | 用户自己的 AI 服务账户 |
| 视频 | 火山方舟 Ark / Seedance 类 | SASI_BYOK_SEEDANCE_PROFILES + SASI_BYOK_VIDEO_ENABLED | 用户自己的 AI 服务账户 |

### 当前限制

- 文本代码仍保留 doubao-seed-evolving 的旧兜底配置，但有效期已到 2026-09-27；过期后付费请求会被阻止。正式生产必须重新核验当前 Model ID、官方价格、计费条件和有效期。
- 图片当前是一套 profile、一次一张；1K / 2K / 4K 只开放模型真实支持的规格。
- 视频 profiles 已支持 model、resolution、generateAudio、maxDuration、estimatedFenPerSecond、validUntil、priceSource、imageMode。

## 代码里已有，但不能直接宣称正式开放

现有视频 Adapter 已包含：

- 火山 Seedance
- xAI（代码默认 grok-imagine-video-1.5）
- OpenAI（代码默认 sora-2 / sora-2-pro）
- 阿里 Wan（代码默认 wan2.7-t2v）

连接中心还登记：

- OpenAI
- xAI
- Anthropic
- Luma
- 火山方舟
- 阿里云百炼
- 腾讯云
- Google Gemini

“页面可连接”与“真实生成执行已验收”严格分开。

## 中国大陆优先

### 国内常用

1. 火山方舟
2. 阿里云百炼
3. 腾讯云（双密钥链路完成后再开放）

### 海外可选

OpenAI、Anthropic、xAI、Gemini、Luma 等保留为可选服务。用户自行满足对应平台地区、账户和付款条件；灵犀场不代开户、不垫资、不绕过平台限制。

### 本地 / 开源方向

优先研究：

- 文本：Qwen 系列 + Ollama / llama.cpp / vLLM / LM Studio / Jan
- 图片：FLUX.1 schnell + ComfyUI
- 视频：Wan2.2；HunyuanVideo-1.5 作为候选
- 编排：ComfyUI 工作流作为 SASI Capability Graph 本地图像/视频执行节点

上线前逐项复核许可证、硬件需求、性能和商业边界。

## 最简连接体验

页面：**连接 AI 服务**

普通用户只做：

1. 选择平台。
2. 去官方页面创建 API Key。
3. 粘贴 API Key。
4. 点击“保存并连接”。

说明：

> API Key 会加密保存，只用于你主动连接的 AI 服务；页面不会再次显示完整密钥。

后续逐步增加自动模型发现，减少手填 Model ID。

## 创作页收费

第三方 AI 生成：

> **预计费用 ¥2.80**  
> 由你已连接的 AI 服务账户收取。

按钮：

> **确认并生成**

规则：

- 生成前报价。
- 用户确认后才提交。
- 报价必须有来源和有效期。
- 不自动切平台密钥垫付。
- 状态不确定时禁止自动重复提交。
- 最终账单以对应 AI 服务账户记录为准。

## SASI 余额用途

SASI 余额只用于灵犀场自己提供并明确报价的能力，例如：

- 本地 / 平台计算
- FFmpeg / Remotion 合成
- GPU 任务
- 高级导出
- 批量处理
- 长期存储
- 高级项目能力
- 未来团队协作

余额不足时优先在当前任务显示“还差 ¥X”和“充值并继续”，支付完成回到原任务。

## 统一 Generation Catalog

后续把分散的 TEXT / IMAGE / VIDEO profile 逐步统一为能力目录。每个节点至少记录：

- provider
- model
- capability
- protocol
- billingOwner（user / lingxifield / local）
- pricingUnit
- currency
- estimatedRate
- priceSource
- validFrom / validUntil
- verified
- supports
- priority
- enabled

默认由 SASI 自动选择。普通用户只看“快速 / 标准 / 高质量”；需要自主选择时再展开“更换生成方式”。

## P0

1. SASI 创作余额 -> SASI 余额。
2. 连接页明确写“连接 AI 服务”和“API Key”。
3. 国内常用服务优先显示。
4. 修复连接列表字段不一致。
5. 用户 API Key 生成不扣 SASI 余额。
6. 灵犀场不替第三方费用垫付。
7. 报价过期重新报价。
8. 状态不确定时禁止自动重复提交。

## P1

1. 现有火山硬编码 BYOK 逐步迁移统一 Provider Adapter。
2. 国内平台优先做自动模型发现。
3. OpenAI-compatible 作为高级兼容入口，而不是大陆默认入口。
4. Anthropic-compatible 作为后续高级兼容入口。
5. 文本、图片支持多 profile。
6. 建立统一 Generation Catalog。

## P2

1. Ollama / LM Studio / Jan 本地连接。
2. 本地 Qwen 文本能力。
3. FLUX.1 schnell 本地图像能力。
4. Wan2.2 本地视频能力。
5. ComfyUI 接入 Capability Graph。
6. GPU / RAM / VRAM 检测与自动降级。

## 正式开放模型前必须具备

- 准确供应商和 Model ID
- 账户真实开通状态
- 官方价格来源
- 计费单位
- 规格差异
- 价格有效期
- 低成本真实调用验收
- 失败 / 超时 / 不确定状态处理
- 结果保存策略

API Key 不写入文档、仓库、日志或价格表，只进入加密连接链路。
# 灵犀场 SASI 产品规范 / LingxiField SASI Product Specification

## 定位 / Positioning

灵犀场 SASI 是“意识空间 + AI 创造空间”一体化平台。主张：从意识，到作品。

LingxiField SASI unites a consciousness space with an AI creation space. Its promise is: From Intention to Creation.

平台不是模型导航站。简单模式只问用户想做什么、目标、时长、画幅、质量与预算，由路由器选择模型和 Skills；专业模式才显示 Provider、Model、Prompt、Seed、分辨率、声音模型等参数。

This is not a model directory. Simple Mode asks for intent, outcome, duration, aspect ratio, quality and budget, then routes models and Skills automatically. Provider and model controls belong in Professional Mode.

## 两个生产系统 / Two Production Systems

1. SASI Build：需求 → 规划 → 架构 → 编程 → 测试 → 修复 → 安全审查 → 预览 → 部署。
2. SASI Drama：项目理解 → 内容结构 → 人物/场景身份板 → 剧本与分集 → 故事板 → 精分镜 → 声音 → 镜头生成 → 时间线 → 导出。

1. SASI Build: brief → planning → architecture → coding → tests → repair → security review → preview → deployment.
2. SASI Drama: project understanding → story structure → character/scene identity → script and episodes → storyboard → shot plan → voice → shot generation → timeline → export.

## 动态规模 / Dynamic Scope

绝不默认 100 集。系统先读用户输入，再建议 1 条视频、若干集或长期 IP 的合适结构。用户确认集数与单集时长后才进入生产。单次成片导出最长 10 分钟，以 5–15 秒镜头分片生成，不要求模型一次生成长片。

Never default to 100 episodes. The system reads the input first and recommends a single clip, a series, or a long-form IP structure. Production starts only after the user confirms episode count and duration. A project export can reach ten minutes by composing 5–15 second shots.

## 可编辑节点 / Editable Nodes

每个节点支持修改、局部重生成、锁定、复制版本、对比与恢复。上游变化通过 Dependency Graph 将相关下游标记为 `stale`；系统说明受影响镜头和预计费用，由用户选择保留、局部更新或全部更新，不得静默重生成或重复收费。

Every node supports editing, targeted regeneration, locking, version copy, comparison and restore. A dependency graph marks affected descendants as `stale`. Users see impacted shots and estimated cost before choosing whether to keep, selectively update or fully regenerate.

## 身份板与故事板 / Identity and Story Boards

人物身份板锁定外貌、服装、关系、动作、声音、参考图、提示词与禁止变化；场景身份板锁定布局、时间、天气、光线、色调和固定物件。每个故事板镜头保存人物、场景、时长、动作、表情、对白、机位、镜头运动、声音、图像/视频提示词和参考图。

Character and scene identity boards preserve continuity. Each storyboard shot records cast, scene, duration, action, expression, dialogue, camera, motion, sound, prompts and references.

## Skills 与 BYOK / Skills and BYOK

首批仅开放平台维护、版本化的官方 Skills。用户上传与交易必须等沙箱、权限声明、恶意行为审查和版本隔离完成后开放。BYOK 密钥只允许服务端加密保存、脱敏显示、测试、轮换与删除；不得写入浏览器存储、数据库明文或日志。

Only versioned official Skills launch first. User publishing waits for sandboxing, permission declarations, malicious-behavior review and version isolation. BYOK keys must be encrypted server-side, masked, testable, rotatable and deletable—never stored in browser storage, plaintext database fields or logs.

## 边界 / Boundaries

平台不提供视频社区发布。爆款分析只抽象钩子、冲突、回报、节奏和悬念结构，不复制受保护角色、台词、镜头或具体情节。任何外部写入、部署、付费模型调用都必须经用户确认。

The platform does not publish a video community. Hit analysis extracts abstract structure without copying protected characters, dialogue, shots or plots. External writes, deployments and paid model calls require user confirmation.

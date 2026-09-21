# 《落云宗的小尾巴》→ SASI 大脑消化路径

## 一句话
不是「聊天里看过就算学会」，而是：**原文进 Foundry → 身份板锁死 → 逐拍连续性事件 → 金牌规则 → 开拍时检索调用**。

## 五层消化（对应仓库苍玄 Data Foundry V0）

| 层 | 存什么 | 表/动作 | 作用 |
|---|---|---|---|
| L1 源正文 | 每集全文多轨 | `cangxuan_sources` + `import`（`sasi_native` + `opted_in_training`） | 整本上下文，禁止只留摘要 |
| L2 身份板 | 云小棠/陆衡/…永久外形与禁漂 | `cangxuan_characters` + `character` | 防画漂、人设漂 |
| L3 连续性 | 每集每个 Beat 的状态补丁 | `cangxuan_continuity_events` + `event` | 玉佩/袍服/借响代价可追溯 |
| L4 金牌规则 | 快兑现、团宠结构、三轨加速等 | `cangxuan_knowledge_items`（RULE/SHOT/CONTINUITY） | 导演路由与审片标准 |
| L5 生成时调用 | 开剧前检索 L2–L4 | 苍玄导演工作流（待加强） | 真正「变成脑子」 |

## 现状实话（对照代码）
- Foundry **已有** sources / knowledge / characters / continuity 四表与 API。
- 当前 `import` 主要靠正则抽短句知识（每源约几十条），**还不够**把 12 集当完整剧集大脑。
- API 边界里 `trainingEnabled: false`：还没做大模型微调；现阶段智慧 = **记忆库 + 检索**，不是一夜训练出新基座模型。
- 本目录已生成可入库 JSON：`foundry-ingest/`（{'characters': 6, 'episodeImports': 14, 'continuityEvents': 118, 'seedKnowledge': 5}）

## 小仙女可勾选的落地顺序
1. 登录 SASI → 工坊导入：先录入 L2 身份板（6 人）  
2. 按集 `import` E01–E14 全文（勾选训练同意）  
3. 灌入 L3 连续性事件（约 118 条）  
4. 批准 L4 金牌规则为 gold  
5. 让苍玄漫剧席开新项目时 **强制读取** 本系列 identity + 近集 events  
6. （更后）系列包专用 ingest API + Teacher 蒸馏；再谈权重微调

## 已生成文件
- `foundry-ingest/00-manifest.json`
- `foundry-ingest/01-characters.json`
- `foundry-ingest/02-continuity-events.json`
- `foundry-ingest/03-episode-imports.json`
- `foundry-ingest/04-seed-knowledge.json`

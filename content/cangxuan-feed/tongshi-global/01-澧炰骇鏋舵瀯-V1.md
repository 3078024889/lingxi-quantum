# 全球全科通识增产架构 V1

> Celestial 口径：约 **100 亿** 条全球全科通识；人心金牌短条是子集。  
> 格鲁特负责产线；求真不编假。

## 1. 目标与非目标

| 要 | 不要 |
|---|---|
| 命题 · 事件/语境 · 证据 三件套海量入库 | 把底座权重整锅倒进 Foundry |
| 铜银金分级，金标供开拍强检索 | 虚报「已接近 100 亿」 |
| 人心/导演/付费心智作必修金标科 | 盗版整本、账密、假链接 |
| 与二十瓦特双线交换抽象精华 | 用人手逐条写到 100 亿 |

## 2. 流水线

```
公开可引用来源
  → 切片 / 规范化
  → 抽取器（命题+事件+证据+discipline+confidence+source_class）
  → content_hash 去重
  → bronze 入库（海量）
  → 校验器 → silver
  → 审阅/高价值科 → gold（人心、导演、付费心智等）
  → SASI Foundry 检索  +  out-to-ershiwatt 增量
```

## 3. 存储布局（桌面仓）

- `content/cangxuan-feed/tongshi-global/schema/` 条目 schema
- `content/cangxuan-feed/tongshi-global/batches/` 日批 JSON
- `content/cangxuan-feed/renshin-distill/` 人心必修科
- `content/cangxuan-feed/sync-with-ershiwatt/` 双线交换
- `content/cangxuan-feed/luoyun-xiaoweiba/` 原创养料（并行，不占全科体量口径）

## 4. Foundry 映射（近期）

- 全科 bronze/silver：优先 `cangxuan_knowledge_items`（category 以 SCRIPT/RULE 等现有枚举承载，或后续扩表 `tongshi_items`）
- 金标人心/导演：继续现有 knowledge + character + continuity
- `trainingEnabled=false` 阶段：只做记忆+检索；存量够厚再谈专域微调

## 5. 全天教学产线（已挂）

- 触发：每 2 小时
- 每轮：全科批增量 + 人心科 + 交换夹 +（余力）落云宗 1 集
- 汇报：日增量 / 去重存量；禁止完成度吹牛

## 6. 里程碑（务实）

| 阶段 | 成功标准 |
|---|---|
| M0 骨架 | schema + 试点批 + 架构文档（本文件） |
| M1 日万级 | 稳定公开源批抽 + 去重入库 |
| M2 日百万级 | 并行抽取与校验队列 |
| M3 检索可用 | 开拍 L5 对全科抽样 + 金标强检 |
| M∞ 逼近 100 亿 | 算力/存储/源授权决定上限；持续报真数 |


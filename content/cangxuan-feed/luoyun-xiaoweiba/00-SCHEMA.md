# 苍玄短剧训练投喂 Schema｜《落云宗的小尾巴》

> 版权标识：LingxiField 原创 · `opted_in_training` · tier: **gold candidate**  
> 适用系统：LingxiField CangXuan / SASI Data Foundry  
> 语言：简体中文 · 格式：多轨节拍（非摘要体）  
> 继承：字段约定对齐 `/workspace/cangxuan-feed/00-SCHEMA.md`，本文件仅替换本系列枚举与目录。

---

## 1. 投喂层级总览

| 层级 | 文件 | Foundry 类别 | 说明 |
|------|------|-------------|------|
| 系列元数据 | `00-SERIES-BIBLE.md` | `SCRIPT` + `CONTINUITY` | 世界观、身份板、承诺链、爽点语法 |
| 单集剧本 | `episodes/E##.md` | `SCRIPT` | **全文保留**，禁止只吃摘要 |
| Schema 说明 | `00-SCHEMA.md` | 元说明（可不入库） | 本文件，指导解析器 |

**硬性摄入规则（Foundry）**

1. **全文保留**：每集 `beats` 内的 `shot / action / dialogue / 心声 / 表情字 / Q版` 必须完整入库，不得折叠为「本集梗概」。
2. **分类标注**：解析时为每段打上 `SCRIPT`（对白/动作/心声）、`CONTINUITY`（连续性锁定）、`SHOT`（镜头指示）。
3. **身份板优先**：角色外观/服装/声线以 SERIES-BIBLE 身份板为最高优先级；单集 `连续性锁定` 仅可补充当集状态，不可覆盖板面锁定项。
4. **承诺链可检索**：每集头部的 `本集承诺 / 上集回收 / 下集钩子` 单独建索引字段，供跨集一致性校验。

---

## 2. 系列元数据字段（Series Meta）

```yaml
title: 落云宗的小尾巴
title_en: Little Tail of Luoyun Sect
rights:
  owner: LingxiField
  original: true
  opted_in_training: true
  tier: gold_candidate
genre_tags: [宗门团宠, 反差萌, 师兄护短, 老祖护短, 杂灵根逆袭, 心声吐槽, Q版搞笑]
episode_count_target: 80
episode_duration_sec: [90, 120]
```

---

## 3. 单集头部：承诺链三件套

| 字段 | 含义 |
|------|------|
| **本集承诺** | 本集必须兑现的爽点/情节 |
| **上集回收** | 上集钩子在本集如何落地（E01 可写「无」） |
| **下集钩子** | 结尾甩出的未解悬念 |

---

## 4. 节拍多轨格式（Per Beat）

每集 6–10 个节拍。字段：

```markdown
### Beat N｜节拍名
- **time**: 起止秒 或 相对时长
- **shot**: 镜头（景别+运动+焦点）
- **action**: 可见动作与场面调度
- **dialogue**: 对白（角色名：台词）
- **心声**: 内心独白字幕轨
- **表情字**: 夸张表情字/拟声字
- **Q版**: Q 版插帧描述（可选）
- **爽点标签**: 本拍命中的爽点类型
- **连续性锁定**: 外观/服装/伤势/道具/空间状态锁定句
```

### 4.1 本系列爽点标签枚举

`挑衅即兑现` · `护短兑现` · `杂灵反杀` · `反差萌` · `当众打脸` · `心声吐槽` · `Q版爆笑` · `老祖出手` · `团宠加温` · `钩子甩出`

### 4.2 连续性锁定写法示例

```
连续性锁定: 云小棠=补丁云纹外门袍+肩上小雾；腕上霜丝镯未戴；杂灵根光晕隐现五色杂点
```

---

## 5. Foundry 摄入映射

| 节拍字段 | Foundry category |
|----------|------------------|
| dialogue, 心声, action（叙事部分） | `SCRIPT` |
| shot | `SHOT` |
| 连续性锁定, 身份板引用 | `CONTINUITY` |
| 本集承诺/上集回收/下集钩子 | `SCRIPT` + 索引元数据 |
| 表情字, Q版 | `SCRIPT`（字幕/插帧轨） |

**禁止**：只摄入「本集摘要」而丢弃 beats 全文。

---

## 6. 本包目录

```
original-luoyun/
├── 00-SCHEMA.md
├── 00-SERIES-BIBLE.md
├── README.md
└── episodes/
    ├── E01.md … E12.md   # 本包已交付
    └── （后续续写至约 E80）
```

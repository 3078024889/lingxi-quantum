# 灵犀场 · 基石（Foundation）

> v301。这份文档回答一个问题：这套知识体系靠什么保证
> "内容会越来越好，而不只是越来越多"。
> 设计细节见 `docs/KNOWLEDGE-BASE-DESIGN.md`，交接进度见 `docs/HANDOFF.md`。

## 一、体系的四根柱子

```
底线    scripts/lint-knowledge.mjs     不许扭曲（八条写作纪律的可执行化）
上限    scripts/gym-knowledge.mjs      哪段更好（知识健身房，见第三节）
词汇    knowledge/_shared/lexicon.json 同一个概念只用一个词
规则    lib/knowledge-engine.ts        确定性地挑、排、拼，绝不生成
```

lint 和 gym 的分工必须说清楚：**lint 是红线，gym 是天平**。
lint 不通过不许合；gym 不淘汰人，只调 weight——被淘汰的节点
内容还在库里，等改写，不物理删除。

## 二、联锁（Interlock）：v301 引擎升级的核心

### 为什么需要

原有的组合条件只有三种：`contrast`（两维反差）、`bothLow`、
`bothHigh`。写到第三个产品就会撞墙——真正值钱的交叉洞察往往是
三维以上的具体形状：

> "外面稳（stability 高）× 里面慢（recovery 低）× 靠坚持撑着
> （persistence 高）"——这三项拼出来的人，和任何两维组合描述的
> 都不是同一种人。

### Slot（槽位）

```ts
export type Slot = {
  dim: string;        // 钉住哪个维度
  bands: BandKey[];   // 允许落在哪些分数带
};
```

`when.interlock` 是一组槽位。**全部槽位同时被真实分数填满，
联锁才咬合**。缺失的维度直接判不命中，不用 50 兜底——联锁内容
是写给特定形状的人的，宁可不出现，也不能凭默认值硬说。

### comboSpecificity（组合具体度）

命中多条组合时，谁先出？v301 之前只看 `priority`，但 priority
是人工拍的数字，会漂。现在的排序是：

```
comboSpecificity 降序 → priority 降序 → id 字典序（确定性兜底）
```

具体度由条件本身算出：contrast 记 2，bothLow/bothHigh 每维记 1，
interlock 每个槽位记 1 分底分再按允许带数加成（只允许 1 个带
+0.8，允许全部 5 个带 +0）。**说得更准的那条自然压过说得更泛的**，
不需要人工去调 priority 竞赛。

首批联锁节点在 `knowledge/resilience/combos.json`（`r.lock.*`
三条：quiet-anchor / event-engine / slow-keel），它们就是后续
产品写联锁内容的语感基准。

## 三、知识健身房（Knowledge Gym）

### 核心想法

同一个 (章节, 维度, 分数带) 里的多个变体，是同一个擂台上的选手。
库会一直长大，人工盯不过来，所以让节点自己竞争：

```
节点评分    五项加权（篇幅/脚手架/双语/具体度/可证伪度）+ 黑名单扣分
权重排序    组内按分排序，同分按 id 字典序（确定性）
champion晋级 组内冠军且 ≥ 晋级线 → weight 提为 2，被选中概率翻倍
淘汰机制    低于淘汰线 → weight 降为 0，引擎跳过；内容保留等改写
```

两条铁律：

1. **覆盖率红线高于质量红线。** 绝不淘汰组内最后一个存活节点——
   宁可给用户一段平庸的话，不能给一章空白（lint 里记录过的那次
   真实事故）。
2. **评分可复算。** 只依赖节点文本，不依赖时间和随机数。同一份库
   任何时候跑出的榜单完全一致——这和引擎的确定性承诺是同一条承诺。

### 评分哲学

判分标准和写作纪律同源：**温度来自具体，不来自形容词**。
所以"具体度"和"可证伪度"合占 40 分——一段没有任何可对照细节、
用户无法当场确认或否认的文字，写得再漂亮也进不了前列。

全部阈值和标记词表在 `knowledge/_shared/gym.json`。
调标准是改数据，不是改代码。

### 用法

```bash
npm run gym              # 全量评分报告
npm run gym -- --top     # 每组冠军榜 + 总榜前10
npm run gym -- --apply   # 把晋级/淘汰写回 nodes.json 与 gym.json（慎用，看过报告再跑）
npm run lint:knowledge   # 写作纪律红线检查
```

`--apply` 会改动 `nodes.json` 的 weight 和 `gym.json` 的冠军榜，
跑之前先看一遍报告，跑之后 diff 一遍再提交。

## 四、词表（Lexicon）

`knowledge/_shared/lexicon.json`。术语漂移是最隐蔽的质量流失：
用户在第 2 章读到「恢复」、第 7 章读到「回血」，会以为是两件事。

- 概念用 `zh` 列出的规范词；
- `synonyms` 允许在口语语境出现，不作章节术语；
- `avoid` 一律不许出现——gym 评分扣分，需要时可升级进
  `avoid-words.json` 变成 lint 硬错误。

新概念**先加进词表，再开始写节点**。

## 五、v301 改动清单

```
新增  docs/lingxi-foundation.md            本文档
新增  knowledge/_shared/lexicon.json       统一词表
新增  knowledge/_shared/gym.json           健身房规则与冠军榜
新增  scripts/gym-knowledge.mjs            知识健身房（评分/排序/晋级/淘汰）
修改  lib/knowledge-engine.ts              Slot 类型 / interlock 判定 /
                                           comboSpecificity 排序 /
                                           pickVariant 跳过 weight=0
新增  knowledge/resilience/combos.json     r.lock.* 三条联锁节点
修改  package.json                         lint:knowledge / gym 两个脚本
```

三条不能动摇的原则（见 HANDOFF）在 v301 之后依然成立：
创作时可以用 AI，运行时不可以；两层架构；系统没有能力"感应"，
只能把用户走过的路如实映回给他。

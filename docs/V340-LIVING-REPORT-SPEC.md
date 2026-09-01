# V340 · 灵犀场“有灵魂的报告”重构规范

## 一、我查到的当前根因

### 1. `classical-editorial.ts` 不是文言写作器，只是“白话替换器”

当前逻辑是：

- “如果” → “若”
- “因为” → “盖因”
- “没有” → “未”
- “不是” → “非”
- “而是” → “乃”
- 再轮流在段首加：
  - 断曰
  - 所以然
  - 验于事
  - 反观
  - 行法

这会产生“古字皮、AI骨”。

必须停止把**已经写坏的白话**做后置古文化。

### 2. `report-entry-library.ts` 仍是固定 writers 模板

它用：
- primary
- support
- counter

再按 `structureWriters[index] / mechanismWriters[index]` 轮换句式。

所以即使24题不同，正文仍会有明显“模型在套句”。

### 3. 网页端更严重：多个产品实际上仍在加载 `knowledge/resilience/*`

当前 `hybrid-report.ts`：
- qian → resilience knowledge
- tarot → resilience knowledge
- relationship → resilience knowledge
- life-map → resilience knowledge
- daily → resilience knowledge

这会从根上导致：
- 产品只是标题不同
- 知识灵魂仍是“韧性”
- 文言加工以后也只是“韧性内容换皮”

这是必须第一优先修掉的 bug。

### 4. `knowledge-engine.ts` 的思想可以保留

它的：
- 组合节点优先
- 单维节点回退
- 状态层
- 可证伪 tail
- 确定性可复算

这些都对。

错的是“知识库内容太薄 + 多产品共用错库 + 最终语言只是替换”。

---

# 二、新原则：不是“文言化”，而是“先立真判断，再以文言成章”

新链路：

```text
输入事实 / 24 Evidence Leaves / 天文历算
↓
事实层
↓
跨情境证据层
↓
冲突 / 反证 / 缺口
↓
Living Node（人的真实矛盾）
↓
Chapter Question（这一章到底解决什么）
↓
Verdict（先立一句真断）
↓
Lived Scene（落到真实生活）
↓
Cost（优势的代价）
↓
Falsifier（现实可证伪）
↓
浅近文言成章
```

禁止：

```text
白话长文
↓
replace("如果","若")
↓
假文言
```

---

# 三、“有灵魂”不是多写抒情

每一章必须有四个东西：

1. **刺中**
   - 说出用户自己隐约知道、却没说清的矛盾。

2. **代价**
   - 任何优势都必须回答：它帮你什么，又让你付什么。

3. **现实**
   - 必须落入关系、工作、金钱、决定、压力、边界、创造、日常至少一域。

4. **可证伪**
   - 给出一条现实中可能“证明这章说错”的条件。
   - 敢错，才不像算命话术。

---

# 四、正式语言

目标：

- 80% 浅近文言
- 20% 现代证据
- 不仿先秦生僻字
- 不堆“玄、道、气、象”装神秘
- 一句只做一个判断
- 删除解释性废话

### 示例

错误：

> 你有较强的探索驱动，这意味着你面对新事物时往往愿意尝试，但是稳定承载较低可能导致你后续坚持不足。

正确：

> **见新则动，逢未知而兴；然承载未厚，故善启而未必善守。此势用于开局为长，用于久业则易散。**
>
> 现实复核：回看最近三件持续超过90日的事。若真正留下来的，都有固定流程、合作责任或明确期限，则“外在承载替内在持续”这一判断成立。

这里没有一句废话。

---

# 五、Codex实施顺序

## P0：先修错误知识库映射

建立独立目录：

```text
knowledge/life-map/
knowledge/relationship-deep/
knowledge/relationship-business/
knowledge/relationship-other/
knowledge/resilience/
knowledge/romance/
knowledge/wealth/
knowledge/daily-tide/
knowledge/life-mirror/
knowledge/life-oracle/
```

禁止任何产品 fallback 到 resilience。

`hybrid-report.ts` loader 一一对应。

## P1：保留 `knowledge-engine.ts`，升级节点 Schema

每个节点增加：

```ts
userPain
coreTruth
strengthWhenActive
costWhenOverused
suppressedForm
livedScenes[]
falsifiers[]
classicalLexicon[]
modernEvidenceLexicon[]
```

节点不再只是一段 `fieldText.zh`。

## P2：替换 `classical-editorial.ts`

停止大规模字符串 replace。

保留它仅做：
- 禁词审计
- 标点整理
- 证据块保护

真正正文由 `compileLivingChapter()` 直接写成浅近文言。

## P3：小程序与网页共用同一个 report core

小程序：
`Evidence Leaves → Living Nodes`

网页：
`Canonical Facts / astronomical facts → Evidence Leaves compatible projection → Living Nodes`

然后两端都：

```text
Living Nodes
→ same chapter specs
→ same V340 compiler
→ same Chinese publication
```

平台只影响“证据来源”，不影响“最终写作灵魂”。

---

# 六、报告正文不得出现内部节点词

用户不能看到：

- Evidence Leaf
- primary/support/counter
- node
- dimension
- confidence=clear
- structure/mechanism/action

这些全部放 debug trace。

用户只看到：

```text
一句断语
自然成章正文
现实复核
证据等级
```

---

# 七、每章篇幅

不是越长越值钱。

- 断语：25–60字
- 正文：120–260字
- 现实复核：40–100字

证据不足时：
- 直接写“尚不立论”
- 不凑字

---

# 八、千元级 QA

一份报告必须通过：

### Personal specificity
随机抽3章，把姓名遮掉。
如果可以无差别发给70%的人 → fail。

### Cost test
11章至少7章明确写到一种“所得 / 所耗”张力。

### Reality test
11章全部有现实落点。

### Falsifier test
至少8章存在明确可证伪条件。

### Cross-evidence test
每章至少2种独立情境，不允许单题定章。

### Duplicate-language test
同一报告不得反复出现同一开头、同一收尾。

### AI-language audit
禁止：
- 这说明
- 这意味着
- 可能表明
- 综合来看
- 总体而言
- 不是……而是……
- 你需要意识到
- 从某个角度

---

# 九、小程序与网页统一要求

最终不再存在：

```text
网页一套白话
小程序一套假文言
```

统一成：

```text
V340 Living Report Core
```

网页和小程序报告若属于同一产品、同一证据快照，
正文必须具有相同的语言体系与章节灵魂。

允许数据不同导致结论不同，不允许写作质量不同。

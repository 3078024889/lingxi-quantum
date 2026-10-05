# R16R4 — Fixture Matrix Closure

## 当前失败根因

Capability Genome 已经完全闭合：
- capability: 60
- recipes: 118
- public catalog: 118
- unknown capability: 0

下一道 Production Gate 继续发现：
- fixture-matrix 只有 65 个 tool classification
- public catalog 已经是 118
- 缺 53 个 classification

这不是工具分类页的问题，而是 CI 测试矩阵元数据落后。

## 为什么不能随便把 53 个工具都标成 fixture

fixture-matrix 里有三种真实语义：
- `fixture`：已经绑定一个具体 real fixture group；
- `local-contract`：本地确定性功能，做契约验证，但当前没有独立 fixture group；
- `online-contract`：依赖在线 provider / 外部成本路径，CI 做 contract/mock，不做真实付费调用。

如果把所有新增工具都标为 `fixture`，却没有真实 fixtureGroup，就是虚假测试覆盖。

因此 R16R4 采用：
1. 保留现有 65 个 classification；
2. 新增的公开工具根据 tool recipe 的 `privacyMode` 判定：
   - `declared-online` → `online-contract`
   - 其它 → `local-contract`
3. 不伪造不存在的 fixtureGroup；
4. `onlineContractOnly` 与公开 catalog 同步；
5. classificationCount 必须等于 118；
6. 新 audit 同时验证 fixture group 引用、online/local 与 recipe 的语义一致性。

## 全球成熟测试体系提取

成熟 CI 的关键不是“测试数量多”，而是测试元数据不能撒谎：
- deterministic local parser 可用真实 fixture；
- external API / paid provider 走 mock/contract；
- 没有真实 fixture 时应标 contract coverage，而不是伪装 fixture coverage。

这与 Pact 的 contract testing、Inngest 对外部 side-effect 的可重试边界、Temporal 对 Activity 真实副作用边界的思路一致：**验证层级要和真实执行语义匹配。**

## 永久改进

`tool-registry.mjs` 也从“只报 count/第一个”升级成：
- 一次打印全部 missing recipes；
- 一次打印全部 unknown capabilities；
- 一次打印全部 missing fixture classifications；
- 一次打印全部 orphan classifications。

避免以后继续一个错误一个错误地追。

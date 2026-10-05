# R14R1 — Capability Contract Audits / 全球成熟测试体系优势提取

## 当前失败根因

R14 的业务架构其实已经发生了合理升级：

以前：
`knowledge route -> resilientText`

现在：
`knowledge route -> runKnowledgeText -> durable runtime -> resilientText`

但 R9 的老审计仍然要求：
`app/api/knowledge/ask/route.ts` 这个单一文件里必须出现字符串 `resilientText`。

因此它把“实现位置变化”误判成“能力消失”。

这是典型的 brittle implementation test：
测试锁死了内部结构，而不是验证用户需要的能力是否仍然存在。

## 本轮继续提取的成熟平台优势

### Pact / Consumer-Driven Contract Testing
Pact 的核心是验证 consumer 真正依赖的交互契约，而不是要求 provider 内部必须怎么实现。
对 SASI：
旧审计应该验证：
- Knowledge 有 deterministic fallback；
- Knowledge 能到达 resilient execution；
- Connected billing 仍需明确同意；
而不应要求 `resilientText` 必须写在 route 文件里。

### OpenTelemetry Semantic Convention Stability
OpenTelemetry 的稳定语义约定强调：稳定 instrumentation 不能因为内部迁移而破坏外部已有 telemetry 契约；迁移时甚至支持 dual emit。
对 SASI：
我们的审计 contract 也应该版本化：
- capability 名稳定；
- 内部 implementation 可以演进；
- migration 期间旧/新路径可并存；
- 最终再移除旧契约。

### Inngest / Durable Execution
Inngest 明确保存 completed step 结果，并提醒所有 side effect 要进入稳定 step；稳定 step ID 是 active run 跨部署恢复的契约。
对 SASI：
“审计标记”本身也应该绑定 capability/stable ID，而不是绑定某个函数今天放在哪个文件。

### LangGraph Persistence
LangGraph 将 checkpointer（thread-scoped）和 store（cross-thread durable memory）明确分层。
对 SASI：
测试也应该按层：
- Route contract
- Durable adapter contract
- Resilient execution contract
- Persistence contract
而不是一个旧脚本跨层窥探所有实现字符串。

### Langfuse Eval Lifecycle
生产失败 trace 可以转成 dataset，再用于下一版本 regression experiment。
对 SASI：
这次 `R9_KNOWLEDGE_NO_GRACEFUL_FALLBACK` 就应该永久变成 regression fixture：
“当 resilience 被合法委托到 adapter 后，旧 audit 不能误报。”

## R14R1 落地

R9 Knowledge 审计从：
- `route must contain resilientText`

升级成：
- route 必须有 deterministic fallback；
- route 可以直接调用 resilientText；
- 或 route 委托 `runKnowledgeText`；
- 委托时 adapter 必须真实 import/call resilientText；
- durable capability gate 必须存在；
- connected billing contract 必须仍然明确。

新增独立分层审计：
- Knowledge Route Contract
- Durable Delegation Chain
- Resilient Fallback Reachability
- Deterministic Fallback Reachability
- Explicit Billing Contract

## 永久原则

以后旧版本审计不得因为正常架构演进阻止新版本：
1. 优先验证能力/契约；
2. 少验证内部函数放在哪个文件；
3. 只有安全边界、价格、计费、密钥、DB 权限等必须绑定具体实现时才做结构约束；
4. 每次架构迁移都补 regression fixture；
5. 旧 audit 必须支持合法 delegation chain，或显式版本升级。

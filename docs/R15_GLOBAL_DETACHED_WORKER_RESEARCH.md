# R15 — Detached Worker Foundation / 全球平台优势提取

## 本轮重点

R14R2 已把 Knowledge 接入 durable step，但模型调用仍依附一次 HTTP request。
R15 的目标不是立刻改 UX，而是先把“真正后台执行”的底座做到不会丢任务、不会双执行、能渐进升级。

## 全球成熟平台提取

### Temporal 2026
Temporal Worker Versioning 已 GA，支持：
- 新 worker 版本渐进放量；
- 验证后再扩流；
- 坏版本即时回滚；
- 长生命周期 workflow 可在安全边界升级。
2026 还推出 Serverless Workers、Task Queue Priority & Fairness、External Storage Claim-Check。

SASI 提取：
1. Job 使用 `workflow_version`，不是把执行语义绑在某个 deployment hash。
2. Worker 必须保留旧 workflow handler，直到旧 backlog 清空。
3. Queue 有 priority，但加入 aging，避免低优先级永久饥饿。
4. 大 payload 不塞入 event history；job payload 先有 128 KiB 硬上限，未来大资产只存引用。

### Inngest
成熟 durable execution 的核心：
- completed step memoization；
- stable step ID；
- waits 不占 compute；
- idempotency 在 producer / function / external service 分层做；
- provider 接受请求但响应丢失时仍可能重复，所以外部写操作必须使用业务 idempotency key；
- deadline / timeout / permanent-vs-transient error 要明确。

SASI 提取：
- queue 只保证 claim/lease/重试，不虚假承诺 provider exactly-once；
- capped exponential backoff；
- deadline 到期自动失败；
- invalid payload / unsupported workflow version 直接 non-retryable。

### LangGraph
durable execution 的 checkpoint 在 node 边界；node 越小，失败时重复工作越少。
interrupt 可等待数天再恢复，但 side effect 必须与可重放节点分离。

SASI 提取：
- `knowledge.generate.v1` 保持小而稳定；
- 以后 approval/wait 不与付费生成 side effect 混在一个可重放函数里。

### Langfuse
成熟智能系统不止“任务执行成功”，还要：
production trace → dataset → experiment → evaluator → release gate。

SASI 下一阶段应把：
- 超时 run
- 多次 retry run
- fallback run
- 用户差评 run
自动沉淀成脱敏 regression dataset。

### OpenAI Agents SDK
Tracing 将 Task / Agent / Turn / Model / Tool / Handoff / Guardrail 分层。
SASI 继续保持：
- Public Event Plane 给用户；
- Internal Trace Plane 给研发；
不能把 provider/model/stack 泄露给公共 SSE。

## R15 实际落地

新增 Postgres durable jobs：
- `FOR UPDATE SKIP LOCKED` claim；
- lease owner + lease expiry；
- 20 秒 heartbeat；
- lease 丢失后可被其他 worker 接管；
- capped exponential retry backoff；
- deadline；
- priority + aging fairness；
- cancel state；
- workflow version；
- 128 KiB payload hard limit。

新增 worker：
- `/api/internal/sasi/worker/tick`
- 只接受 `Authorization: Bearer $SASI_WORKER_SECRET`
- secret 缺失时 fail closed
- 一次 tick 只 claim 一个 job，避免 serverless invocation 被长队列拖死。

新增版本兼容表：
`knowledge.generate -> knowledge.v1`

未来上线 v2 时：
不要直接删 v1 handler。
必须先确认 v1 backlog=0，再移除。

## 重要边界

R15 是 Detached Worker Foundation，不默认切换现有 Knowledge UX。
原因：
- 当前 Knowledge UI 仍以同步 answer 响应为主；
- 贸然切成 202 queued 会破坏用户体验；
- 下一轮要把 `runId + snapshot + SSE + result` 接入 UI 后再开启 feature flag。

因此 R15 做到了“后台可运行”，但还没有对普通用户默认启用。

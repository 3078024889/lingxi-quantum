# R14 — Knowledge Durable Adoption / 全球持续执行优势提取

## 本轮全球检索后的关键结论

### Inngest
成熟 durable step 的关键不是“会重试”，而是：
- 每个 step 有稳定 ID；
- 已完成 step 的返回结果被保存；
- 后续重试只执行失败 step；
- 外部 side effect 仍必须使用稳定业务 idempotency key；
- 不能把大对象反复复制进 run state，应该保存引用；
- temporary 与 permanent error 要分开。

R14 因此引入 `knowledge.generate.v1` 稳定 step ID 和 Postgres memoized result。

### Temporal
Temporal 的 Worker 会根据 event history replay workflow；已经执行过的 Activity/Timer 在 replay 时直接从历史返回，不重新执行。
而且长生命周期 workflow 的代码升级必须考虑 Worker Versioning / patch compatibility。

R14 因此不把“函数重跑”理解为“模型再调一次”：
只要 `knowledge.generate.v1` 成功结果已经记录，同一个 run/input 重放时直接复用。

### LangGraph
LangGraph 明确区分：
- checkpointer：thread-scoped state / fault tolerance / HITL；
- store：cross-thread durable memory。
interrupt/resume 还提醒一个非常关键的坑：
resume 时 node 会从节点开头重新运行，所以 interrupt 前面的 side effect 可能再次执行。

这进一步证明：
SASI 所有外部副作用必须放进 memoized durable step，而不是放在可重放的普通流程代码里。

### Trigger.dev
Waitpoints 可以暂停任务等待人工审批、外部 callback、用户输入，并且任务之后继续。
这说明 SASI 的 connected-service 付费边界也应该是明确的人类选择，而不能因为内部 fallback 自动进入付费链路。

## R14 实际落地

1. Knowledge 正式成为第一个采用 durable step 的 SASI 真实业务。
2. `knowledge.generate.v1`：
   - run + step + input hash 唯一；
   - succeeded 直接 replay；
   - running lease 防并发重复；
   - lease 过期才允许重新 claim；
   - step 输出 JSON 存 PostgreSQL。
3. connected service 改为双条件：
   - `useConnectedService === true`
   - `acceptConnectedBilling === true`
4. UI 默认不启用 connected service。
5. 每个用户 turn ID 同时作为 HTTP `Idempotency-Key`。
6. Durable DB migration 未部署时，Knowledge 仍回退到原有 resilientText，不让数据库演进阻断用户问答。
7. durable layer 自身故障时，保留 grounded deterministic fallback。

## 仍然不冒充完成的部分

R14 仍然是“request-attached durable adoption”：
- 模型执行仍发生在这次 HTTP request 的 server process 中；
- 服务器在模型调用中途消失后，没有独立 worker 自动继续；
- Provider 接受请求但响应丢失时，没有统一 provider-level idempotency，仍不能承诺 exactly-once。

下一阶段 R15 才应解决：
**Detached Worker + Claim/Lease + Resume**
让 HTTP 只负责创建/观察 Run，真正执行与浏览器生命周期彻底解耦。

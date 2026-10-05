# R13 全球成熟持续智能平台提取：Resumable Event Plane

## 本轮检索到的关键新优势

### Mastra Durable Agents（2026）
Mastra 已把“浏览器刷新、网络闪断、客户端断开后继续观察同一个 agent stream”作为 Durable Agents 的核心能力。
其思路是：
- stream 不再属于发起它的 HTTP 连接；
- runId 是重新订阅的锚点；
- event stream 被缓存/持久化；
- 用户可以从另一个客户端回来重新观察进行中或已完成的 run。

这直接对应 SASI：
“用户关掉网页 ≠ SASI 的事情消失”。

### Mastra 公开 bug 给我们的反向优势
2026 的公开 issue 暴露了两个非常有价值的坑：
1. suspend 后如果进程重启，resume 可能因为 in-memory registry 丢失而失败；
2. durable/Inngest adapter 在 resume 时可能丢失 resumeData，导致同一 tool 被重新执行并再次 suspend。

因此 SASI 以后所有 pause/approval/resume 都必须有负向测试：
- cold restart resume；
- resume payload round-trip；
- suspended tool exactly-once；
- 不允许仅靠内存 registry。

### Temporal 2026 Worker Versioning
Temporal 的 Worker Versioning 已 GA，可渐进放量新 worker、即时回滚，并让长生命周期 workflow 在安全边界升级 worker 版本。
对 SASI 的意义：
跨小时/跨天 run 不能被新部署破坏。未来 worker schema/step IDs 必须版本化。

### Temporal Standalone Activities + Priority/Fairness
2026 Standalone Activities 已 GA，支持 durable jobs、priority、fairness、start delay、lifecycle controls。
对 SASI 的意义：
未来短剧渲染、OCR、索引、网站构建等不一定都需要完整 workflow；可以成为 durable activity/job，但仍统一进入 Run/Event/Trace。

### Microsoft Agent Framework + AG-UI
AG-UI 通过 SSE 把 STEP_STARTED / STEP_FINISHED / RUN_FINISHED / interrupt 等事件发给前端。
失败时公共 UI 只暴露 generic message/error code，内部 traceback 留在服务器。
对 SASI 的意义：
Provider 名、模型名、内部堆栈、密钥、数据库异常都不能穿过公共 event plane。

### OpenAI Agents tracing
Session → turns → trace → steps 的层次与 SASI 的 Thread → Turn → Run → Step 很接近。
trace 可以覆盖 model/tool/handoff/guardrail。
对 SASI 的意义：
UI event plane 与内部 trace plane 要分离：
- 公共 event：给用户看；
- internal trace：给运营/研发定位。

### Hatchet
开源 MIT，Postgres 作为 durable runtime 和 observability 基础，支持 crash/restart 后从 checkpoint 继续，并带 streaming/HITL。
这证明 SASI 当前依靠 Postgres/Supabase 建立自己的轻量 durable layer 是合理路线，不必一开始就引入重型独立集群。

### Langfuse
2026 已把 production trace → dataset → experiment → online evaluator 打成闭环。
对 SASI 的意义：
未来失败或低分的真实 run 可以一键沉淀成 regression dataset，成为下一版发布门禁。

## R13 落地

本轮不是只定义事件类型，而是做了真实可重连 Event Plane：

- `GET /api/sasi/runs/[runId]/events`
  - SSE
  - 登录认证
  - run ownership
  - Last-Event-ID / after cursor
  - heartbeat
  - 24 秒连接窗口后可由浏览器自动重连
  - terminal run 自动收口
  - 不暴露内部 provider / model / stack

- `GET /api/sasi/runs/[runId]/snapshot`
  - 页面刷新后先恢复 snapshot
  - 再接 SSE 增量
  - 防止只靠内存 UI state

- `useSasiRunStream`
  - snapshot bootstrap
  - EventSource reconnect
  - event id 去重
  - 最多保留最近 200 条公开事件

- Durable orchestrator 开始写：
  - RUN_STARTED
  - STEP_STARTED
  - STEP_FINISHED
  - RUN_COMPLETED
  - RUN_FAILED

## 还没有假装完成的部分

R13 还不是完整后台 Worker：
- website/drama/knowledge 现有主流程还没有全部切到 durableExecute；
- pause/resume/cancel 仍是 contract/schema，没有真实 worker wait loop；
- TEXT_DELTA 还不是模型原生 token streaming；
- cross-device 只有 event/snapshot 基础设施，尚未把所有 SASI UI 绑定 runId。

下一轮应进入 R14：
**Durable Run Adoption**
把 Knowledge → Website → Drama 分批接入同一个 durable runtime，而不是一次性大爆炸迁移。

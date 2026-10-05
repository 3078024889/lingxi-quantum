# R12R1 全球成熟 Agent / Durable 平台优势提取

本轮继续核查并提取机制，不照搬第三方实现。

## CopilotKit / AG-UI
- AG-UI 使用 SSE 事件承载 messages、state updates、tool calls、agent lifecycle。
- Shared State 是双向的：Agent 改状态，UI 实时变化；用户改 UI，Agent 下一步能读取。
- 对 SASI 的意义：聊天、项目状态、工具执行、作品版本不应该分成互不相干的前端状态。

## Inngest
- 完成 step 的结果持久化，后续只重试失败 step。
- `RetryAfterError` 可以遵循上游服务给出的恢复时间。
- 所有 side effect 必须有稳定 idempotency key。
- wait / signal 不占运行计算资源。
- Durable Endpoint 可以让普通 HTTP 请求在临时故障后恢复。
- 对 SASI 的意义：发布、扣费、创建工件、发起生成都必须按业务动作幂等，不按“重试次数”幂等。

## DBOS
- Workflow 从最后完成 step 自动恢复。
- 可显式 resume；还能从指定 step fork 新 workflow。
- 对 SASI 的意义：以后“回到网站 V2 从这里重做”“从某个失败镜头重新分支”应该是一等能力，而不是手工复制项目。

## LangGraph / 类图式 Agent
- 持久 checkpoint + interrupt/resume 是复杂 Agent 的核心。
- 对 SASI 的意义：等待人工确认必须是 Run 的可恢复状态，不是结束后新开一轮。

## Mastra / Trigger.dev / Hatchet 等
- suspend/resume、durable background work、replay/retry、worker failure recovery 已经成为成熟 Agent 平台的共同能力。
- 对 SASI 的意义：长任务必须与浏览器生命周期解耦。

## R12R1 本轮落地
1. 修复 R12 对 `KnowledgeWorkspace.tsx` 的精确字符串依赖，改成 ask() 作用域内的语义锚点。
2. R12 之前已部分修改的文件再次运行不会失败。
3. 用户输入与发送后的用户消息继续强制蓝色。
4. 新增 SASI 自有事件协议 contract：
   - RUN_STARTED
   - TEXT_DELTA
   - STATE_SNAPSHOT
   - STEP_STARTED / STEP_FINISHED
   - ARTIFACT_CREATED
   - APPROVAL_REQUIRED
   - RUN_WAITING / RUN_RESUMED
5. 新增 Artifact Lineage contract。
6. 新增 pause/resume/cancel/approve/reject Run Control contract。
7. 数据库预留 artifact version 与 run control 持久层。

## 下一阶段真正值得做的难事
- 用 SSE 真正实现上面的事件协议，而不是只定义类型；
- 把 website/drama/book/learning/research 的局部 state 迁进 canonical Thread/Run/Project；
- 后台 Worker / Durable Executor 与浏览器生命周期解耦；
- Artifact fork / restore；
- Approval 等待数小时或数天后原 Run 原地继续；
- 跨设备恢复；
- 真正流式 TTFT / throughput 观测；
- Golden eval + chaos replay。
